export function sortItems(types) {
  const priceItems = document.querySelector("#price_items");
  if (!priceItems) return { ok: false, error: "#price_items not found" };

  const tiers = "piotr";
  const tickets = Array.from(priceItems.children);

  const getType = (t) =>
    t.querySelector("strong").textContent.trim().split(" ")[0];

  const getTypeLong = (t) =>
    t
      .querySelector("strong")
      .textContent.trim()
      .split(" ")
      .slice(0, 2)
      .join(" ");

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
    if (getTypeLong(a) !== getTypeLong(b))
      return getTypeLong(a).localeCompare(getTypeLong(b));
    return getTier(a) - getTier(b);
  });

  miscTypes.sort((a, b) => getType(a).localeCompare(getType(b)));

  [...mainTypes, ...miscTypes].forEach((t) => priceItems.appendChild(t));

  return { ok: true, count: tickets.length };
}
