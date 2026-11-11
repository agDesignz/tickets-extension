// src/background/service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
	await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
	await chrome.sidePanel.setOptions({
		enabled: true,
		path: "sidepanel.html",
		windowId: chrome.windows.WINDOW_ID_CURRENT
	});
});

//# sourceMappingURL=service-worker.js.map