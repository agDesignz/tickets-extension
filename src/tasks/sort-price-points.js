// document.querySelector("body").addEventListener("click", handleSort);
const defaultTypeOrder = [
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

function sortPricePoints(typeOrder) {
  if (!typeOrder) typeOrder = defaultTypeOrder;
  const priceItems = document.querySelector("#price_items");

  const typeOrder = Object.fromEntries(
    typeOrder.map((key, index) => [key, index]),
  );
  //   console.log("typeOrder"[typeOrder.Tier]);

  const tiers = "piotr";
  //   const tierOrder = Object.fromEntries(tiers.map((key, index) => [key, index]));

  const tickets = Array.from(document.querySelector("#price_items").children);

  function getType(tick) {
    return tick.querySelector("strong").textContent.trim().split(" ")[0];
  }

  function getTypeLong(tick) {
    return tick
      .querySelector("strong")
      .textContent.trim()
      .split(" ")
      .slice(0, 2)
      .join(" ");
  }

  function getPosition(tick) {
    return typeOrder.indexOf(getType(tick)); // Returns
  }

  function getTier(tick) {
    const tierLetter = tick
      .querySelectorAll("span")[1]
      .textContent[0].toLowerCase();
    return tiers.indexOf(tierLetter);
  }

  const mainTypes = [];
  const miscTypes = [];

  tickets.forEach((t) => {
    getPosition(t) >= 0 ? mainTypes.push(t) : miscTypes.push(t);
  });

  mainTypes.sort((a, b) => {
    if (getType(a) !== getType(b)) {
      return getPosition(a) - getPosition(b);
    } else if (getTypeLong(a) !== getTypeLong(b)) {
      return getTypeLong(a) - getTypeLong(b);
    } else {
      return getTier(a) - getTier(b);
    }
  });

  miscTypes.sort((a, b) => {
    return getType(a) - getType(b);
  });

  const ticketsSorted = [...mainTypes, ...miscTypes];
  console.log(ticketsSorted.length);
  ticketsSorted.forEach((el) => {
    console.log(getTypeLong(el), getPosition(el), getTier(el));
  });

  ticketsSorted.forEach((t) => {
    priceItems.appendChild(t);
  });
}
