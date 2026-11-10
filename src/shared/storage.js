export async function getStored(key, fallback) {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? fallback;
}

export function setStored(key, value) {
  return chrome.storage.local.set({ [key]: value });
}
