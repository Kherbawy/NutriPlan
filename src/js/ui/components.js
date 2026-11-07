// src/js/ui/components.js

export const categoryStyles = {
  Beef: { icon: "fa-drumstick-bite", bg: "from-red-50 to-rose-50", border: "border-red-200 hover:border-red-400", badge: "from-red-400 to-rose-500" },
  Chicken: { icon: "fa-drumstick-bite", bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", badge: "from-amber-400 to-orange-500" },
  Dessert: { icon: "fa-cake-candles", bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", badge: "from-pink-400 to-rose-500" },
  Lamb: { icon: "fa-bone", bg: "from-orange-50 to-amber-50", border: "border-orange-200 hover:border-orange-400", badge: "from-orange-400 to-amber-500" },
  Miscellaneous: { icon: "fa-bowl-food", bg: "from-slate-50 to-gray-50", border: "border-slate-200 hover:border-slate-400", badge: "from-slate-400 to-gray-500" },
  Pasta: { icon: "fa-bowl-rice", bg: "from-yellow-50 to-amber-50", border: "border-yellow-200 hover:border-yellow-400", badge: "from-yellow-400 to-amber-500" },
  Pork: { icon: "fa-bacon", bg: "from-rose-50 to-red-50", border: "border-rose-200 hover:border-rose-400", badge: "from-rose-400 to-red-500" },
  Seafood: { icon: "fa-fish", bg: "from-cyan-50 to-blue-50", border: "border-cyan-200 hover:border-cyan-400", badge: "from-cyan-400 to-blue-500" },
  Side: { icon: "fa-plate-wheat", bg: "from-emerald-50 to-green-50", border: "border-emerald-200 hover:border-emerald-400", badge: "from-emerald-400 to-green-500" },
  Starter: { icon: "fa-utensils", bg: "from-teal-50 to-cyan-50", border: "border-teal-200 hover:border-teal-400", badge: "from-teal-400 to-cyan-500" },
  Vegan: { icon: "fa-leaf", bg: "from-green-50 to-emerald-50", border: "border-green-200 hover:border-green-400", badge: "from-green-400 to-emerald-500" },
  Vegetarian: { icon: "fa-seedling", bg: "from-lime-50 to-green-50", border: "border-lime-200 hover:border-lime-400", badge: "from-lime-400 to-green-500" },
  Breakfast: { icon: "fa-mug-saucer", bg: "from-amber-50 to-yellow-50", border: "border-amber-200 hover:border-amber-400", badge: "from-amber-400 to-yellow-500" },
  Goat: { icon: "fa-drumstick-bite", bg: "from-stone-50 to-amber-50", border: "border-stone-200 hover:border-stone-400", badge: "from-stone-400 to-amber-500" },
};

export function getLoadingSpinner() {
  return `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  `;
}

export function getEmptyState(title = "No recipes found", subtitle = "Try searching for something else") {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg font-medium">${title}</p>
      <p class="text-gray-400 text-sm mt-2">${subtitle}</p>
    </div>
  `;
}

export function getNutriScoreColor(grade) {
  const g = (grade || "").toLowerCase();
  if (g === "a") return "bg-green-500";
  if (g === "b") return "bg-lime-500";
  if (g === "c") return "bg-yellow-500";
  if (g === "d") return "bg-orange-500";
  if (g === "e") return "bg-red-500";
  return "bg-gray-400";
}

export function getNovaColor(nova) {
  const n = Number(nova);
  if (n === 1) return "bg-green-500";
  if (n === 2) return "bg-lime-500";
  if (n === 3) return "bg-orange-500";
  if (n === 4) return "bg-red-500";
  return "bg-gray-400";
}
