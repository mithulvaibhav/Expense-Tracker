const CATEGORIES = ["Food", "Travel", "Shopping", "Cinema","Entertainment","Petrol"];

export class ExpenseManager {
  constructor() {
    this.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  }

  save() {
    localStorage.setItem("expenses", JSON.stringify(this.expenses));
  }

  add(name, amount, category, date) {
    this.expenses.push({ id: Date.now(), name, amount, category, date });
    this.save();
  }

  remove(id) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.save();
  }

  replace(list) {
    this.expenses = list;
    this.save();
  }

  thisMonth() {
    const d = new Date();
    const month = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    return this.expenses.filter((e) => e.date.startsWith(month));
  }

  monthTotal() {
    return this.thisMonth().reduce((sum, e) => sum + e.amount, 0);
  }

  view(text, category, order) {
    const list = this.expenses.filter(
      (e) => e.name.toLowerCase().includes(text.toLowerCase()) &&
             (category === "All" || e.category === category)
    );
    return list.sort((a, b) =>
      order === "new" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
  }
}

export function validate(name, amount, date) {
  if (!/^[A-Za-z]{2,20}$/.test(name)) return "Name must be 2-30 letters or numbers.";
  if (!(amount > 0)) return "Amount must be greater than 0.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Please select a valid date.";
  return "";
}

export function validImport(data) {
  return Array.isArray(data) && data.every((e) =>
    e.id && typeof e.amount === "number" && CATEGORIES.includes(e.category) &&
    validate(e.name, e.amount, e.date) === ""
  );
}

export async function getRate() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await res.json();
    return data.rates.USD;
  } catch (error) {
    console.log("Could not get exchange rate", error);
    return null;
  }
}
