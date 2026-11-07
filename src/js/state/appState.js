// src/js/state/appState.js

export class AppState {
  constructor() {
    this.storageKey = "nutriplan_foodlog";
    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
    };
  }

  getTodayKey() {
    return new Date().toISOString().split("T")[0];
  }

  getAllLogs() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const today = this.getTodayKey();
        return { [today]: parsed };
      }
      return parsed;
    } catch (e) {
      return {};
    }
  }

  getTodayItems() {
    const logs = this.getAllLogs();
    const today = this.getTodayKey();
    return logs[today] || [];
  }

  addFoodItem(item) {
    const logs = this.getAllLogs();
    const today = this.getTodayKey();
    if (!logs[today]) {
      logs[today] = [];
    }

    const newEntry = {
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      name: item.name,
      image: item.image || "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
      type: item.type || "Meal",
      servings: Number(item.servings) || 1,
      calories: Math.round(Number(item.calories) || 0),
      protein: Math.round(Number(item.protein) || 0),
      carbs: Math.round(Number(item.carbs) || 0),
      fat: Math.round(Number(item.fat) || 0),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    logs[today].push(newEntry);
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
    return newEntry;
  }

  removeFoodItem(id) {
    const logs = this.getAllLogs();
    const today = this.getTodayKey();
    if (logs[today]) {
      logs[today] = logs[today].filter((item) => String(item.id) !== String(id));
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    }
  }

  clearTodayLog() {
    const logs = this.getAllLogs();
    const today = this.getTodayKey();
    logs[today] = [];
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  getTodayTotals() {
    const items = this.getTodayItems();
    return items.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein) || 0;
        acc.carbs += Number(item.carbs) || 0;
        acc.fat += Number(item.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  getLast7DaysSummary() {
    const logs = this.getAllLogs();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayItems = logs[key] || [];
      const totalCalories = dayItems.reduce(
        (sum, item) => sum + (Number(item.calories) || 0),
        0
      );
      const totalProtein = dayItems.reduce(
        (sum, item) => sum + (Number(item.protein) || 0),
        0
      );
      const totalCarbs = dayItems.reduce(
        (sum, item) => sum + (Number(item.carbs) || 0),
        0
      );
      const totalFat = dayItems.reduce(
        (sum, item) => sum + (Number(item.fat) || 0),
        0
      );
      days.push({
        key,
        label,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      });
    }
    return days;
  }
}
