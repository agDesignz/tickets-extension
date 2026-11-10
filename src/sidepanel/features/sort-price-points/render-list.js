export function renderList(container, items, onMove) {
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
