// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// src/shared/constants.js
var DEFAULT_TYPE_ORDER = [
	"Adult",
	"Senior",
	"Tier",
	"Comp/Gift",
	"Student",
	"Under",
	"Blue",
	"Season",
	"Rush",
	"Group",
	"Production"
];
// src/shared/storage.js
async function getStored(key, fallback) {
	return (await chrome.storage.local.get(key))[key] ?? fallback;
}
function setStored(key, value) {
	return chrome.storage.local.set({ [key]: value });
}
// src/shared/run-in-tab.js
async function runInActiveTab(func, args = []) {
	const [tab] = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	});
	if (!tab?.id) throw new Error("No active tab");
	const [injection] = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func,
		args
	});
	return injection?.result;
}
// src/tasks/sort-price-points.js
function sortItems(types) {
	const priceItems = document.querySelector("#price_items");
	if (!priceItems) return {
		ok: false,
		error: "#price_items not found"
	};
	const tiers = "piotr";
	const tickets = Array.from(priceItems.children);
	const getType = (t) => t.querySelector("strong").textContent.trim().split(" ")[0];
	const getTypeLong = (t) => t.querySelector("strong").textContent.trim().split(" ").slice(0, 2).join(" ");
	const getPosition = (t) => types.indexOf(getType(t));
	const getTier = (t) => {
		const letter = t.querySelectorAll("span")[1]?.textContent[0]?.toLowerCase();
		return tiers.indexOf(letter);
	};
	const mainTypes = [];
	const miscTypes = [];
	tickets.forEach((t) => (getPosition(t) >= 0 ? mainTypes : miscTypes).push(t));
	mainTypes.sort((a, b) => {
		if (getType(a) !== getType(b)) return getPosition(a) - getPosition(b);
		if (getTypeLong(a) !== getTypeLong(b)) return getTypeLong(a).localeCompare(getTypeLong(b));
		return getTier(a) - getTier(b);
	});
	miscTypes.sort((a, b) => getType(a).localeCompare(getType(b)));
	[...mainTypes, ...miscTypes].forEach((t) => priceItems.appendChild(t));
	return {
		ok: true,
		count: tickets.length
	};
}
// src/sidepanel/features/sort-price-points/render-list.js
function renderList(container, items, onMove) {
	container.innerHTML = "";
	items.forEach((item, i) => {
		const li = document.createElement("li");
		const label = document.createElement("span");
		label.textContent = item;
		const up = document.createElement("button");
		up.type = "button";
		up.textContent = "↑";
		up.dataset.action = "up";
		up.disabled = i === 0;
		up.setAttribute("aria-label", `Move ${item} up`);
		up.addEventListener("click", () => onMove(i, i - 1));
		const down = document.createElement("button");
		down.type = "button";
		down.textContent = "↓";
		down.dataset.action = "down";
		down.disabled = i === items.length - 1;
		down.setAttribute("aria-label", `Move ${item} down`);
		down.addEventListener("click", () => onMove(i, i + 1));
		li.append(label, up, down);
		container.appendChild(li);
	});
}
// src/sidepanel/features/sort-price-points/index.js
var STORAGE_KEY = "typeOrder";
async function initSortFeature() {
	const root = document.querySelector("#sort-task");
	const listEl = root.querySelector("#type-list");
	const statusEl = root.querySelector("#sort-status");
	let typeOrder = await getStored(STORAGE_KEY, [...DEFAULT_TYPE_ORDER]);
	const refresh = () => renderList(listEl, typeOrder, handleMove);
	async function handleMove(from, to) {
		[typeOrder[from], typeOrder[to]] = [typeOrder[to], typeOrder[from]];
		refresh();
		const row = listEl.children[to];
		const dir = to < from ? "up" : "down";
		(row.querySelector(`[data-action="${dir}"]:not(:disabled)`) ?? row.querySelector("button:not(:disabled)"))?.focus();
		statusEl.textContent = `${typeOrder[to]} moved to position ${to + 1} of ${typeOrder.length}.`;
		await setStored(STORAGE_KEY, typeOrder);
	}
	root.querySelector("#sort-confirm").addEventListener("click", async () => {
		statusEl.textContent = "Sorting…";
		try {
			const result = await runInActiveTab(sortItems, [typeOrder]);
			statusEl.textContent = result?.ok ? `Sorted ${result.count} items.` : `Failed: ${result?.error ?? "unknown error"}`;
		} catch (err) {
			statusEl.textContent = `Error: ${err.message}`;
		}
	});
	root.querySelector("#sort-reset").addEventListener("click", async () => {
		typeOrder = [...DEFAULT_TYPE_ORDER];
		refresh();
		statusEl.textContent = "Order reset to default.";
		await setStored(STORAGE_KEY, typeOrder);
	});
	refresh();
}
// src/sidepanel/index.js
initSortFeature();

//# sourceMappingURL=sidepanel-BZ7EtZAR.js.map