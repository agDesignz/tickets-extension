// shared/storage.js
const DEFAULT_TYPES_ORDER = [
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
  "Production",
];

export async function getSortingOrder() {
  const result = await chrome.storage.local.get("sortingOrder");
  return result.sortingOrder || DEFAULT_ORDER;
}

export async function saveSortingOrder(order) {
  await chrome.storage.local.set({ sortingOrder: order });
}
