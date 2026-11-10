export async function runInActiveTab(func, args = []) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab?.id) throw new Error("No active tab");

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func,
    args,
  });
  return injection?.result;
}
