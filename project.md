# Chrome Extension Architecture Overview

This extension is built using a Vite + Node.js workflow to enable modular JavaScript and SCSS styling. The entire user interface is contained within a side panel (not a popup), using an accordion layout for organizing tasks and settings.
Project Structure

```
my-extension/
├── src/
│   ├── manifest.json          # Extension manifest (MV3)
│   ├── background/
│   │   └── service-worker.js  # Background service worker
│   ├── sidepanel/
│   │   ├── index.html         # Side panel HTML
│   │   ├── index.scss         # Side panel styles
│   │   └── index.js           # Side panel logic (UI, accordion, button handlers)
│   ├── tasks/                 # Separate JS files for each task
│   │   ├── sort-items.js      # Task 1: Sort DOM elements
│   │   ├── fill-inputs.js     # Task 2: Fill input fields (future)
│   │   └── extract-data.js    # Task 3: Extract data (future)
│   └── shared/                # Shared utilities
│       ├── storage.js         # chrome.storage helpers
│       └── constants.js       # Default values, config
├── dist/                      # Build output (what Chrome loads)
├── package.json
├── vite.config.js
└── .gitignore
```

Key Decisions

## 1. Build Tool: Vite with vite-plugin-web-extension

Vite is used for its fast development server, hot module replacement (HMR), and efficient bundling. The vite-plugin-web-extension plugin automatically discovers all files referenced in manifest.json and builds them into a dist/ directory.

For more information, see the [Vite Plugin Web Extension documentation](https://vite-plugin-web-extension.aklinker1.io/guide/).

## 2. User Interface: Side Panel with Accordion

The entire UI is in the side panel, not a popup. This avoids cross-context messaging complexity and keeps everything in one place.

### The accordion uses CSS Grid for smooth open/close animations:

```scss
.task-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;

  & > * {
    overflow: hidden;
  }

  &.is-open {
    grid-template-rows: 1fr;
  }
}
```

This approach is clean, requires no hardcoded heights, and works with dynamic content.

## 3. Task Architecture: Separate Files, Injected on Demand

Each task lives in its own file in the tasks/ folder. When a user clicks a button in the side panel, the corresponding task script is injected into the active tab’s context using chrome.scripting.executeScript.

### Why this approach?

- Separation of concerns: Each task is isolated in its own file
- Scalability: Adding a new task is as simple as creating a new file in tasks/ and adding a button in the side panel
- Maintainability: Logic for each task is easy to find, test, and modify
- Best practice: Google recommends chrome.scripting.executeScript for one-off execution of extension-owned code

See [Google’s modern web guidance on scripting](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/chrome-extensions/references/extensions/user-scripts.md) for more details.

## 4. How Script Injection Works

### Step 1: Declare permissions in manifest.json

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "permissions": ["activeTab", "scripting", "storage"],
  "action": {
    "default_panel": "sidepanel/index.html"
  },
  "background": {
    "service_worker": "background/service-worker.js"
  }
}
```

- activeTab: Grants temporary access to the active tab when the user interacts with the extension
- scripting: Required to use chrome.scripting.executeScript
- storage: Required to use chrome.storage.local

For more details, see the [Chrome Extension Manifest V3 Reference](https://developer.chrome.com/docs/extensions/mv3/manifest/).

### Step 2: Call injection from sidepanel.js

```javascript
// sidepanel/index.js
import { getSortingOrder } from "../shared/storage.js";

async function performSort() {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject the task script with arguments
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: sortItemsInPage,
    args: [await getSortingOrder()], // Pass the sort order as an argument
  });
}

// Define the function that will be injected
function sortItemsInPage(order) {
  // This function runs in the page context
  // It has access to the page's DOM
  const listItems = document.querySelectorAll("your-selector-here");
  const itemsArray = Array.from(listItems);

  itemsArray.sort((a, b) => {
    const textA = a.textContent.trim();
    const textB = b.textContent.trim();
    const indexA = order.indexOf(textA);
    const indexB = order.indexOf(textB);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  // Re-append items in sorted order
  const parent = listItems[0]?.parentNode;
  if (parent) {
    itemsArray.forEach((item) => parent.appendChild(item));
  }
}
```

Key Points About Injection

1.  The function runs in the page context: It has access to document, window, and page variables, but not to chrome.\* APIs (except chrome.runtime for messaging)

2.  Arguments are passed via args: The args array contains JSON-serializable values that are passed to the injected function

3.  The function must be defined in your bundled code: In MV3, you can no longer execute arbitrary code strings. The function must be part of the extension package

4.  No separate content script file needed: Since the function is defined inline in sidepanel.js, you don’t need a separate file in tasks/ for simple operations. For more complex tasks, you can define the function in a separate file and import it:

```javascript
// tasks/sort-items.js
export function sortItemsInPage(order) {
  // ... logic
}
```

```javascript
// sidepanel/index.js
import { sortItemsInPage } from "../tasks/sort-items.js";

async function performSort() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: sortItemsInPage,
    args: [await getSortingOrder()],
  });
}
```

For more details, see the [chrome.scripting.executeScript API documentation](https://developer.chrome.com/docs/extensions/reference/api/scripting).

## 5. Adding New Tasks

To add a new task:

1. Create a new file in tasks/ (e.g., tasks/fill-inputs.js)
2. Export the function that will be injected:

```javascript
// tasks/fill-inputs.js
export function fillInputsInPage(data) {
  // Logic to fill input fields
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    if (data[input.name]) {
      input.value = data[input.name];
    }
  });
}
```

### 1. Import the function in sidepanel/index.js:

```javascript
import { fillInputsInPage } from "../tasks/fill-inputs.js";
```

### 2. Add a button in sidepanel/index.html:

```html
<button id="fill-inputs-btn">Fill Inputs</button>
```

### 3. Add an event listener in sidepanel/index.js:

```javascript
document
  .getElementById("fill-inputs-btn")
  .addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const data = { username: "john", email: "john@example.com" };

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillInputsInPage,
      args: [data],
    });
  });
```

## 6. Persisting User Preferences

User preferences are stored using chrome.storage.local:

```javascript
// shared/storage.js
const DEFAULT_ORDER = ["first", "second", "third"];

export async function getSortingOrder() {
  const result = await chrome.storage.local.get("sortingOrder");
  return result.sortingOrder || DEFAULT_ORDER;
}

export async function saveSortingOrder(order) {
  await chrome.storage.local.set({ sortingOrder: order });
}
```

Usage in sidepanel:

```javascript
import { getSortingOrder, saveSortingOrder } from "../shared/storage.js";

// Read saved order
const order = await getSortingOrder();

// Save new order
await saveSortingOrder(newOrder);
```

## 7. Development Workflow

```bash
# Start development server (opens Chrome with extension loaded)
yarn dev

# Build for production
yarn build
```

The dist/ directory contains the built extension. To load it in Chrome:

1. Go to chrome://extensions/
2. Enable “Developer mode”
3. Click “Load unpacked”
4. Select the dist/ directory

## Resources

- [Vite Plugin Web Extension Documentation](https://vite-plugin-web-extension.aklinker1.io/guide/)
- [Chrome Extension Manifest V3 Reference](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [chrome.scripting.executeScript API](https://developer.chrome.com/docs/extensions/reference/api/scripting)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/develop/best-practices)
- [Content Scripts Documentation](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

## Summary

This architecture provides:

- Modular code: Each task is in its own file, easy to maintain and scale
- Clean separation: UI logic (sidepanel) is separate from task logic (tasks/)
- Scalability: Adding new tasks is straightforward
- Best practices: Uses MV3-approved APIs and Google-recommended patterns

---

To create the file:

1. **Copy** everything between the triple backticks above (including the backticks)
2. **Paste** it into a text editor (VS Code, Sublime Text, Notepad++, etc.)
3. **Save** the file as `architecture.md`

Alternatively, if you have a terminal available, you can create it directly:

```bash
cat > architecture.md << 'EOF'
# Chrome Extension Architecture

## Overview
...
EOF
```
