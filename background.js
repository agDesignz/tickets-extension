// Listen for address bar icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // Open the side panel for the current window
  await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });

  // Optional: Focus the side panel if it’s already open
  await chrome.sidePanel.setOptions({
    enabled: true,
    path: "sidepanel.html",
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });
});
