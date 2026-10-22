import { ExpenseManager, validate, validImport, getRate } from "./data.js";

const manager = new ExpenseManager();
const $ = (id) => document.getElementById(id);
let budget = Number(localStorage.getItem("budget")) || 0;
let rate = null;

function render() {
  $("tbody").innerHTML = "";
  for (const e of manager.view($("search").value, $("filter").value, $("sort").value)) {
    $("tbody").innerHTML += `<tr><td>${e.name}</td><td>₹${e.amount}</td><td>${e.category}</td>
      <td>${e.date}</td><td><button data-id="${e.id}">Delete</button></td></tr>`;
  }

  const spent = manager.monthTotal();
  $("spent").textContent = "₹" + spent;
  $("count").textContent = manager.thisMonth().length;
  $("remaining").textContent = "₹" + (budget - spent);
  $("usd").textContent = rate ? "$" + (spent * rate).toFixed(2) : "-";
  $("warning").hidden = !(budget > 0 && spent > budget);
}


$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const amount = Number($("amount").value);
  const date = $("date").value;
  const error = validate(name, amount, date);
  $("error").textContent = error;
  if (error) return;
  manager.add(name, amount, $("category").value, date);
  $("form").reset();
  render();
});


$("budgetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  budget = Number($("budget").value);
  localStorage.setItem("budget", budget);
  render();
});

$("tbody").addEventListener("click", (e) => {
  if (e.target.dataset.id) {
    manager.remove(Number(e.target.dataset.id));
    render();
  }
});


for (const id of ["search", "filter", "sort"]) $(id).addEventListener("input", render);


$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(manager.expenses, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.json";
  link.click();
});

$("import").addEventListener("click", () => $("file").click());
$("file").addEventListener("change", async (e) => {
  try {
    const data = JSON.parse(await e.target.files[0].text());
    if (!validImport(data)) return alert("Invalid file structure.");
    if (confirm("Replace all existing expenses?")) manager.replace(data);
  } catch (error) {
    alert("Could not read the file.");
  }
  e.target.value = "";
  render();
});

$("clear").addEventListener("click", () => {
  if (confirm("Delete all expenses?")) {
    manager.replace([]);
    render();
  }
});

$("budget").value = budget || "";
render();
rate = await getRate();
render();
