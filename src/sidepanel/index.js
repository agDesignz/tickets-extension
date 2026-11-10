// // Fetch and display the active tab’s URL
// async function displayActiveTabUrl() {
//   try {
//     // Get the currently active tab
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     const tabUrlElement = document.getElementById("tab-url");

//     if (tab && tab.url) {
//       tabUrlElement.textContent = tab.url;
//     } else {
//       tabUrlElement.textContent = "No URL available";
//     }
//   } catch (error) {
//     console.error("Error fetching tab URL:", error);
//     document.getElementById("tab-url").textContent = "Error loading URL";
//   }
// }

// // Add click handler to the "Say Hello" button
// document.getElementById("ludus-btn").addEventListener("click", () => {
//   const messageElement = document.getElementById("greet-message");
//   messageElement.textContent = "Hello from the side panel! 👋";

//   // Clear message after 3 seconds
//   setTimeout(() => {
//     messageElement.textContent = "";
//   }, 3000);
// });

// // Initialize: Fetch tab URL when the side panel loads
// displayActiveTabUrl();
import { getSortingOrder, saveSortingOrder } from "../shared/storage.js";

// Read saved order
const order = await getSortingOrder();

// Save new order
await saveSortingOrder(newOrder);

// sidepanel/index.js
import { sortPricePoints } from "../tasks/sort-price-points.js";

async function sortPricePoints() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: sortPricePoints,
    args: [await getSortingOrder()],
  });
}

// Events
document
  .querySelector("#sort-price-points")
  .addEventListener("click", sortPricePoints);
