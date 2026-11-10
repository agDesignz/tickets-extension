import { DEFAULT_TYPE_ORDER } from "../../../shared/constants.js";
import { getStored, setStored } from "../../../shared/storage.js";
import { runInActiveTab } from "../../../shared/run-in-tab.js";
import { sortItems } from "../../../tasks/sort-price-points.js";
import { renderList } from "./render-list.js";

const STORAGE_KEY = "typeOrder";

export async function initSortFeature() {
  const root = document.querySelector("#sort-task");
  const listEl = root.querySelector("#type-list");
  const statusEl = root.querySelector("#sort-status");

  let typeOrder = await getStored(STORAGE_KEY, [...DEFAULT_TYPE_ORDER]);

  const refresh = () => renderList(listEl, typeOrder, handleMove);

  async function handleMove(from, to) {
    [typeOrder[from], typeOrder[to]] = [typeOrder[to], typeOrder[from]];
    refresh();

    // Restore focus to the moved item's button. If it's now at the end of
    // the list and that button is disabled, fall back to the other one.
    const row = listEl.children[to];
    const dir = to < from ? "up" : "down";
    const target =
      row.querySelector(`[data-action="${dir}"]:not(:disabled)`) ??
      row.querySelector("button:not(:disabled)");
    target?.focus();

    // Announced by the role="status" live region
    statusEl.textContent = `${typeOrder[to]} moved to position ${to + 1} of ${typeOrder.length}.`;

    await setStored(STORAGE_KEY, typeOrder);
  }

  root.querySelector("#sort-confirm").addEventListener("click", async () => {
    statusEl.textContent = "Sorting…";
    try {
      const result = await runInActiveTab(sortItems, [typeOrder]);
      statusEl.textContent = result?.ok
        ? `Sorted ${result.count} items.`
        : `Failed: ${result?.error ?? "unknown error"}`;
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
