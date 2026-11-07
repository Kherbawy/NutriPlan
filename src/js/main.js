// src/js/main.js
import { NutriPlanAPI } from "./api/mealdb.js";
import { AppState } from "./state/appState.js";
import {
  categoryStyles,
  getLoadingSpinner,
  getEmptyState,
  getNutriScoreColor,
  getNovaColor,
} from "./ui/components.js";

const api = new NutriPlanAPI();
const appState = new AppState();

// ============= DOM ELEMENTS =============
const loadingOverlay = document.getElementById("app-loading-overlay");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const headerMenuBtn = document.getElementById("header-menu-btn");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
const navBtns = document.querySelectorAll(".nav-link");
const headerTitle = document.querySelector("#header h1");
const headerSubtitle = document.querySelector("#header p");

// Sections
const searchFiltersSection = document.getElementById("search-filters-section");
const mealCategoriesSection = document.getElementById("meal-categories-section");
const allRecipesSection = document.getElementById("all-recipes-section");
const mealDetailsSection = document.getElementById("meal-details");
const productsSection = document.getElementById("products-section");
const foodlogSection = document.getElementById("foodlog-section");

// Home / Meals Page Elements
const searchInput = document.getElementById("search-input");
const areasContainer = searchFiltersSection.querySelector(".flex.items-center.gap-3");
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");
const recipesCount = document.getElementById("recipes-count");
const gridViewBtn = document.getElementById("grid-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

// Meal Details Elements
const backToMealsBtn = document.getElementById("back-to-meals-btn");
const logMealBtn = document.getElementById("log-meal-btn");
const nutritionFactsContainer = document.getElementById("nutrition-facts-container");

// Product Scanner Elements
const productSearchInput = document.getElementById("product-search-input");
const searchProductBtn = document.getElementById("search-product-btn");
const barcodeInput = document.getElementById("barcode-input");
const lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
const nutriScoreBtns = document.querySelectorAll(".nutri-score-filter");
const productCategoryBtns = document.querySelectorAll(".product-category-btn");
const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");

// Food Log Elements
const foodlogDate = document.getElementById("foodlog-date");
const foodlogTodaySection = document.getElementById("foodlog-today-section");
const loggedItemsList = document.getElementById("logged-items-list");
const clearFoodlogBtn = document.getElementById("clear-foodlog");
const weeklyChartContainer = document.getElementById("weekly-chart");
const quickLogBtns = document.querySelectorAll(".quick-log-btn");

// ============= GLOBAL VARIABLES =============
let allCategories = [];
let allAreas = [];
let allMeals = [];
let currentMeal = {
  idMeal: "52772",
  strMeal: "Teriyaki Chicken Casserole",
  strCategory: "Chicken",
  strArea: "Japanese",
  strMealThumb: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
};
let currentMealNutrition = {
  servings: 4,
  perServing: { calories: 485, protein: 35, carbs: 48, fat: 14, fiber: 5, sugar: 8 },
  totals: { calories: 1940, protein: 140, carbs: 192, fat: 56, fiber: 20, sugar: 32 },
};
let allProducts = [];
let selectedNutriGrade = "";
let currentArea = "All";
let isListView = false;

// ============= SIDEBAR & NAVIGATION START =============
const navPages = ["home", "scanner", "foodlog"];

function switchPage(pageName, pushUrl = true) {
  searchFiltersSection.classList.add("hidden");
  mealCategoriesSection.classList.add("hidden");
  allRecipesSection.classList.add("hidden");
  mealDetailsSection.classList.add("hidden");
  productsSection.classList.add("hidden");
  foodlogSection.classList.add("hidden");

  navBtns.forEach(function (btn) {
    btn.classList.remove("bg-emerald-50", "text-emerald-700");
    btn.classList.add("text-gray-600", "hover:bg-gray-50");
  });

  if (pageName === "home") {
    searchFiltersSection.classList.remove("hidden");
    mealCategoriesSection.classList.remove("hidden");
    allRecipesSection.classList.remove("hidden");
    navBtns[0].classList.add("bg-emerald-50", "text-emerald-700");
    navBtns[0].classList.remove("text-gray-600", "hover:bg-gray-50");
    headerTitle.innerHTML = "Meals & Recipes";
    headerSubtitle.innerHTML = "Discover delicious and nutritious recipes tailored for you";
  } else if (pageName === "details") {
    mealDetailsSection.classList.remove("hidden");
    navBtns[0].classList.add("bg-emerald-50", "text-emerald-700");
    navBtns[0].classList.remove("text-gray-600", "hover:bg-gray-50");
    headerTitle.innerHTML = "Meal Details";
    headerSubtitle.innerHTML = "View full recipe instructions and nutritional analysis";
  } else if (pageName === "scanner") {
    productsSection.classList.remove("hidden");
    navBtns[1].classList.add("bg-emerald-50", "text-emerald-700");
    navBtns[1].classList.remove("text-gray-600", "hover:bg-gray-50");
    headerTitle.innerHTML = "Product Scanner";
    headerSubtitle.innerHTML = "Search packaged foods or lookup products by barcode";
  } else if (pageName === "foodlog") {
    foodlogSection.classList.remove("hidden");
    navBtns[2].classList.add("bg-emerald-50", "text-emerald-700");
    navBtns[2].classList.remove("text-gray-600", "hover:bg-gray-50");
    headerTitle.innerHTML = "Daily Food Log";
    headerSubtitle.innerHTML = "Track and monitor your daily nutrition intake";
    displayFoodLog();
  }

  if (pushUrl) {
    try {
      window.history.pushState({ page: pageName }, "", `#${pageName}`);
    } catch (e) {
      window.location.hash = pageName;
    }
  }

  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navBtns.forEach(function (navBtn, index) {
  navBtn.addEventListener("click", (e) => {
    e.preventDefault();
    switchPage(navPages[index]);
  });
});

window.addEventListener("popstate", (e) => {
  const page = (e.state && e.state.page) || window.location.hash.replace("#", "") || "home";
  switchPage(page, false);
});

if (headerMenuBtn) {
  headerMenuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
  });
}

if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  });
}
// ============= SIDEBAR & NAVIGATION END =============

// ============= HOME PAGE (CATEGORIES, AREAS, MEALS) START =============
async function initHomePage() {
  try {
    const [categories, areas, meals] = await Promise.all([
      api.getCategories(),
      api.getAreas(),
      api.searchMeals("chicken"),
    ]);

    allCategories = categories.slice(0, 12);
    allAreas = areas;
    allMeals = meals;

    displayCategories();
    displayAreas();
    displayMeals();
  } catch (err) {
    console.error("Error loading initial data:", err);
  } finally {
    loadingOverlay.classList.add("loading");
    loadingOverlay.style.display = "none";
  }
}

function displayCategories() {
  let cartona = ``;
  for (let i = 0; i < allCategories.length; i++) {
    const catName = allCategories[i].strCategory;
    const style = categoryStyles[catName] || categoryStyles.Miscellaneous;

    cartona += `
      <div
        onclick="filterMealsByCategory('${catName}')"
        class="category-card bg-gradient-to-br ${style.bg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group"
        data-category="${catName}"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="text-white w-9 h-9 bg-gradient-to-br ${style.badge} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
          >
            <i class="fa-solid ${style.icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${catName}</h3>
          </div>
        </div>
      </div>
    `;
  }
  categoriesGrid.innerHTML = cartona;
}

function displayAreas() {
  let cartona = `
    <button
      onclick="filterMealsByArea('All')"
      class="area-filter-btn px-4 py-2 ${
        currentArea === "All"
          ? "bg-emerald-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } rounded-full font-medium text-sm whitespace-nowrap transition-all"
    >
      All Cuisines
    </button>
  `;

  for (let i = 0; i < allAreas.length; i++) {
    const areaName = allAreas[i].strArea;
    const isActive = currentArea === areaName;
    cartona += `
      <button
        onclick="filterMealsByArea('${areaName}')"
        class="area-filter-btn px-4 py-2 ${
          isActive
            ? "bg-emerald-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } rounded-full font-medium text-sm whitespace-nowrap transition-all"
      >
        ${areaName}
      </button>
    `;
  }
  areasContainer.innerHTML = cartona;
}

function displayMeals() {
  recipesCount.innerHTML = `Showing ${allMeals.length} recipes`;

  if (allMeals.length === 0) {
    recipesGrid.innerHTML = getEmptyState();
    return;
  }

  let cartona = ``;
  for (let i = 0; i < allMeals.length; i++) {
    const meal = allMeals[i];
    const category = meal.strCategory || "Recipe";
    const area = meal.strArea || "Global";
    const description = meal.strInstructions
      ? meal.strInstructions.substring(0, 90) + "..."
      : "Click to view full ingredients, step-by-step instructions, and nutrition facts.";

    if (isListView) {
      cartona += `
        <div
          onclick="openMealDetails('${meal.idMeal}')"
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center gap-4 p-3"
          data-meal-id="${meal.idMeal}"
        >
          <div class="relative w-32 h-24 rounded-lg overflow-hidden shrink-0">
            <img
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src="${meal.strMealThumb}"
              alt="${meal.strMeal}"
              loading="lazy"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
              ${meal.strMeal}
            </h3>
            <p class="text-xs text-gray-600 mb-2 line-clamp-2">${description}</p>
            <div class="flex items-center gap-4 text-xs">
              <span class="font-semibold text-gray-900">
                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${category}
              </span>
              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}
              </span>
            </div>
          </div>
        </div>
      `;
    } else {
      cartona += `
        <div
          onclick="openMealDetails('${meal.idMeal}')"
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          data-meal-id="${meal.idMeal}"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src="${meal.strMealThumb}"
              alt="${meal.strMeal}"
              loading="lazy"
            />
            <div class="absolute bottom-3 left-3 flex gap-2">
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
                ${category}
              </span>
              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                ${area}
              </span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
              ${meal.strMeal}
            </h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              ${description}
            </p>
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-gray-900">
                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                ${category}
              </span>
              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                ${area}
              </span>
            </div>
          </div>
        </div>
      `;
    }
  }

  recipesGrid.innerHTML = cartona;
}

window.filterMealsByCategory = async function (category) {
  recipesGrid.innerHTML = getLoadingSpinner();
  const filtered = await api.filterByCategory(category);
  allMeals = filtered.map((m) => ({ ...m, strCategory: category }));
  displayMeals();
};

window.filterMealsByArea = async function (area) {
  currentArea = area;
  displayAreas();
  recipesGrid.innerHTML = getLoadingSpinner();

  if (area === "All") {
    allMeals = await api.searchMeals("chicken");
  } else {
    const filtered = await api.filterByArea(area);
    allMeals = filtered.map((m) => ({ ...m, strArea: area }));
  }
  displayMeals();
};

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const query = searchInput.value.trim();
    recipesGrid.innerHTML = getLoadingSpinner();
    allMeals = await api.searchMeals(query || "chicken");
    displayMeals();
  }, 350);
});

gridViewBtn.addEventListener("click", () => {
  isListView = false;
  recipesGrid.className = "grid grid-cols-4 gap-5";
  gridViewBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
  listViewBtn.className = "px-3 py-1.5";
  displayMeals();
});

listViewBtn.addEventListener("click", () => {
  isListView = true;
  recipesGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";
  listViewBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
  gridViewBtn.className = "px-3 py-1.5";
  displayMeals();
});
// ============= HOME PAGE END =============

// ============= MEAL DETAILS PAGE START =============
function extractIngredientsList(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      list.push({
        ingredient: ing.trim(),
        measure: measure ? measure.trim() : "",
        combined: `${measure ? measure.trim() : ""} ${ing.trim()}`.trim(),
      });
    }
  }
  return list;
}

window.openMealDetails = async function (mealId) {
  switchPage("details");
  const meal = await api.getMealById(mealId);
  if (!meal) return;

  currentMeal = meal;
  const ingredientsList = extractIngredientsList(meal);

  const heroImg = mealDetailsSection.querySelector(".relative.h-80 img");
  const heroTitle = mealDetailsSection.querySelector("h1");
  const heroBadgesContainer = mealDetailsSection.querySelector(".flex.items-center.gap-3.mb-3");
  const heroServings = document.getElementById("hero-servings");
  const heroCalories = document.getElementById("hero-calories");

  heroImg.setAttribute("src", meal.strMealThumb);
  heroImg.setAttribute("alt", meal.strMeal);
  heroTitle.innerHTML = meal.strMeal;

  let badgesHtml = `
    <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory || "Meal"}</span>
    <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea || "International"}</span>
  `;
  if (meal.strTags) {
    const firstTag = meal.strTags.split(",")[0].trim();
    if (firstTag) {
      badgesHtml += `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${firstTag}</span>`;
    }
  }
  heroBadgesContainer.innerHTML = badgesHtml;

  const ingredientsBox = mealDetailsSection.querySelector(".lg\\:col-span-2 > div:nth-child(1)");
  let ingCartona = ``;
  for (let i = 0; i < ingredientsList.length; i++) {
    ingCartona += `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
        <span class="text-gray-700">
          <span class="font-medium text-gray-900">${ingredientsList[i].measure}</span> ${ingredientsList[i].ingredient}
        </span>
      </div>
    `;
  }
  ingredientsBox.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-list-check text-emerald-600"></i>
      Ingredients
      <span class="text-sm font-normal text-gray-500 ml-auto">${ingredientsList.length} items</span>
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      ${ingCartona}
    </div>
  `;

  const instructionsBox = mealDetailsSection.querySelector(".lg\\:col-span-2 > div:nth-child(2)");
  const steps = meal.strInstructions
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  let stepsCartona = ``;
  for (let i = 0; i < steps.length; i++) {
    stepsCartona += `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${i + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">${steps[i]}</p>
      </div>
    `;
  }
  instructionsBox.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
      Instructions
    </h2>
    <div class="space-y-4">
      ${stepsCartona}
    </div>
  `;

  const videoIframe = mealDetailsSection.querySelector("iframe");
  if (meal.strYoutube && meal.strYoutube.includes("v=")) {
    const videoId = meal.strYoutube.split("v=")[1].split("&")[0];
    videoIframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
  } else {
    videoIframe.setAttribute("src", "");
  }

  nutritionFactsContainer.innerHTML = getLoadingSpinner();
  const ingredientStrings = ingredientsList.map((item) => item.combined);
  const nutritionData = await api.analyzeNutrition(meal.strMeal, ingredientStrings);

  if (nutritionData && nutritionData.perServing) {
    currentMealNutrition = {
      servings: nutritionData.servings || 4,
      perServing: {
        calories: Math.round(nutritionData.perServing.calories || 450),
        protein: Math.round(nutritionData.perServing.protein || 30),
        carbs: Math.round(nutritionData.perServing.carbs || 45),
        fat: Math.round(nutritionData.perServing.fat || 15),
        fiber: Math.round(nutritionData.perServing.fiber || 4),
        sugar: Math.round(nutritionData.perServing.sugar || 6),
      },
      totals: {
        calories: Math.round(nutritionData.totals?.calories || 1800),
      },
    };
  } else {
    const estCal = ingredientsList.length * 52;
    currentMealNutrition = {
      servings: 4,
      perServing: {
        calories: estCal,
        protein: Math.round((estCal * 0.25) / 4),
        carbs: Math.round((estCal * 0.45) / 4),
        fat: Math.round((estCal * 0.3) / 9),
        fiber: 5,
        sugar: 8,
      },
      totals: {
        calories: estCal * 4,
      },
    };
  }

  heroServings.innerHTML = `${currentMealNutrition.servings} servings`;
  heroCalories.innerHTML = `${currentMealNutrition.perServing.calories} cal/serving`;
  displayMealNutritionFacts();
};

function displayMealNutritionFacts() {
  const p = currentMealNutrition.perServing;
  const totalCal = currentMealNutrition.totals.calories;

  const proteinPct = Math.min(100, Math.round((p.protein / 50) * 100));
  const carbsPct = Math.min(100, Math.round((p.carbs / 250) * 100));
  const fatPct = Math.min(100, Math.round((p.fat / 65) * 100));
  const fiberPct = Math.min(100, Math.round((p.fiber / 30) * 100));
  const sugarPct = Math.min(100, Math.round((p.sugar / 50) * 100));

  nutritionFactsContainer.innerHTML = `
    <p class="text-sm text-gray-500 mb-4">Per serving (${currentMealNutrition.servings} servings total)</p>

    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${p.calories}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${totalCal} cal</p>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span class="text-gray-700">Protein</span>
        </div>
        <span class="font-bold text-gray-900">${p.protein}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPct}%"></div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-700">Carbs</span>
        </div>
        <span class="font-bold text-gray-900">${p.carbs}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPct}%"></div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-gray-700">Fat</span>
        </div>
        <span class="font-bold text-gray-900">${p.fat}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPct}%"></div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-orange-500"></div>
          <span class="text-gray-700">Fiber</span>
        </div>
        <span class="font-bold text-gray-900">${p.fiber}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-orange-500 h-2 rounded-full" style="width: ${fiberPct}%"></div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-pink-500"></div>
          <span class="text-gray-700">Sugar</span>
        </div>
        <span class="font-bold text-gray-900">${p.sugar}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-pink-500 h-2 rounded-full" style="width: ${sugarPct}%"></div>
      </div>
    </div>
  `;
}

backToMealsBtn.addEventListener("click", () => {
  switchPage("home");
});

logMealBtn.addEventListener("click", () => {
  if (!currentMeal) return;
  const p = currentMealNutrition.perServing;

  const oldModal = document.getElementById("log-meal-modal");
  if (oldModal) oldModal.remove();

  const modalDiv = document.createElement("div");
  modalDiv.id = "log-meal-modal";
  modalDiv.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  modalDiv.innerHTML = `
    <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
      <div class="flex items-center gap-4 mb-6">
        <img src="${currentMeal.strMealThumb}" alt="${currentMeal.strMeal}" class="w-16 h-16 rounded-xl object-cover">
        <div>
          <h3 class="font-bold text-xl text-gray-900">Log This Meal</h3>
          <p class="text-sm text-gray-500">${currentMeal.strMeal}</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Number of Servings</label>
        <div class="flex items-center gap-3">
          <button type="button" id="decrement-servings" class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <i class="fa-solid fa-minus"></i>
          </button>
          <input id="servings-input" type="number" min="0.5" step="0.5" value="1" class="w-20 text-center py-2 border border-gray-300 rounded-lg font-semibold text-gray-900">
          <button type="button" id="increment-servings" class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>

      <div class="bg-emerald-50 rounded-xl p-4 mb-6">
        <p class="text-xs text-gray-500 mb-2">Estimated nutrition per serving:</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div>
            <span id="modal-cal" class="block text-lg font-bold text-emerald-600">${p.calories}</span>
            <span class="text-xs text-gray-500">Calories</span>
          </div>
          <div>
            <span id="modal-pro" class="block text-lg font-bold text-blue-600">${p.protein}g</span>
            <span class="text-xs text-gray-500">Protein</span>
          </div>
          <div>
            <span id="modal-carb" class="block text-lg font-bold text-amber-600">${p.carbs}g</span>
            <span class="text-xs text-gray-500">Carbs</span>
          </div>
          <div>
            <span id="modal-fat" class="block text-lg font-bold text-purple-600">${p.fat}g</span>
            <span class="text-xs text-gray-500">Fat</span>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button type="button" id="cancel-log-meal-btn" class="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="button" id="confirm-log-meal-btn" class="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <i class="fa-solid fa-clipboard-list"></i>
          Log Meal
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);

  const servingsInput = modalDiv.querySelector("#servings-input");
  const decBtn = modalDiv.querySelector("#decrement-servings");
  const incBtn = modalDiv.querySelector("#increment-servings");
  const cancelBtn = modalDiv.querySelector("#cancel-log-meal-btn");
  const confirmBtn = modalDiv.querySelector("#confirm-log-meal-btn");

  function updateModalNumbers() {
    const val = Math.max(0.5, parseFloat(servingsInput.value) || 1);
    modalDiv.querySelector("#modal-cal").innerHTML = Math.round(p.calories * val);
    modalDiv.querySelector("#modal-pro").innerHTML = `${Math.round(p.protein * val)}g`;
    modalDiv.querySelector("#modal-carb").innerHTML = `${Math.round(p.carbs * val)}g`;
    modalDiv.querySelector("#modal-fat").innerHTML = `${Math.round(p.fat * val)}g`;
  }

  decBtn.addEventListener("click", () => {
    let val = parseFloat(servingsInput.value) || 1;
    if (val > 0.5) {
      servingsInput.value = val - 0.5;
      updateModalNumbers();
    }
  });

  incBtn.addEventListener("click", () => {
    let val = parseFloat(servingsInput.value) || 1;
    servingsInput.value = val + 0.5;
    updateModalNumbers();
  });

  servingsInput.addEventListener("input", updateModalNumbers);

  cancelBtn.addEventListener("click", () => {
    modalDiv.remove();
  });

  modalDiv.addEventListener("click", (e) => {
    if (e.target === modalDiv) modalDiv.remove();
  });

  confirmBtn.addEventListener("click", () => {
    const servings = Math.max(0.5, parseFloat(servingsInput.value) || 1);
    appState.addFoodItem({
      name: currentMeal.strMeal,
      image: currentMeal.strMealThumb,
      type: "Meal",
      servings: servings,
      calories: p.calories * servings,
      protein: p.protein * servings,
      carbs: p.carbs * servings,
      fat: p.fat * servings,
    });

    modalDiv.remove();
    displayFoodLog();

    Swal.fire({
      icon: "success",
      title: "Meal Logged!",
      text: `${currentMeal.strMeal} (${servings} serving) added to your daily log.`,
      timer: 1800,
      showConfirmButton: false,
    });
  });
});
// ============= MEAL DETAILS PAGE END =============

// ============= PRODUCT SCANNER START =============
async function handleProductSearch() {
  const query = productSearchInput.value.trim();
  if (!query) return;

  productsGrid.innerHTML = getLoadingSpinner();
  productsCount.innerHTML = `Searching for "${query}"...`;
  allProducts = await api.searchProducts(query);
  displayProducts();
}

async function handleBarcodeLookup() {
  const barcode = barcodeInput.value.trim();
  if (!barcode) return;

  productsGrid.innerHTML = getLoadingSpinner();
  productsCount.innerHTML = `Looking up barcode ${barcode}...`;
  const product = await api.getProductByBarcode(barcode);

  if (product) {
    allProducts = [product];
    displayProducts();
    openProductModal(0);
  } else {
    allProducts = [];
    displayProducts();
    Swal.fire({
      icon: "warning",
      title: "Product Not Found",
      text: `No product found with barcode "${barcode}"`,
      confirmButtonColor: "#10b981",
    });
  }
}

function displayProducts() {
  const filtered = selectedNutriGrade
    ? allProducts.filter(
        (p) => (p.nutriscore_grade || "").toLowerCase() === selectedNutriGrade
      )
    : allProducts;

  productsCount.innerHTML = `Showing ${filtered.length} products`;

  if (filtered.length === 0) {
    productsGrid.innerHTML = getEmptyState(
      "No products found",
      "Try searching for another product name, category, or barcode"
    );
    return;
  }

  let cartona = ``;
  for (let i = 0; i < filtered.length; i++) {
    const prod = filtered[i];
    const originalIndex = allProducts.indexOf(prod);
    const name = prod.product_name || "Unknown Product";
    const brand = prod.brands || "Generic Brand";
    const img =
      prod.image_front_small_url ||
      prod.image_url ||
      "https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg";
    const quantity = prod.quantity || "100g";
    const grade = (prod.nutriscore_grade || "unknown").toLowerCase();
    const nova = prod.nova_group || "-";

    const nutriments = prod.nutriments || {};
    const kcal = Math.round(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0);
    const protein = Number(nutriments.proteins_100g || 0).toFixed(1);
    const carbs = Number(nutriments.carbohydrates_100g || 0).toFixed(1);
    const fat = Number(nutriments.fat_100g || 0).toFixed(1);
    const sugar = Number(nutriments.sugars_100g || 0).toFixed(1);

    cartona += `
      <div
        onclick="openProductModal(${originalIndex})"
        class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-barcode="${prod.code || ""}"
      >
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            src="${img}"
            alt="${name}"
            loading="lazy"
          />
          <div class="absolute top-2 left-2 ${getNutriScoreColor(grade)} text-white text-xs font-bold px-2 py-1 rounded uppercase">
            ${grade.length === 1 ? `Nutri-Score ${grade.toUpperCase()}` : "N/A"}
          </div>
          <div class="absolute top-2 right-2 ${getNovaColor(nova)} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${nova}">
            ${nova}
          </div>
        </div>

        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${name}
          </h3>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-weight-scale mr-1"></i>${quantity}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${kcal} kcal/100g</span>
          </div>

          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${protein}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${carbs}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${fat}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${sugar}g</p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  productsGrid.innerHTML = cartona;
}

window.openProductModal = function (index) {
  const prod = allProducts[index];
  if (!prod) return;

  const name = prod.product_name || "Unknown Product";
  const brand = prod.brands || "Generic Brand";
  const img =
    prod.image_front_small_url ||
    prod.image_url ||
    "https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg";
  const nutriments = prod.nutriments || {};
  const kcal = Math.round(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0);
  const protein = Math.round(nutriments.proteins_100g || 0);
  const carbs = Math.round(nutriments.carbohydrates_100g || 0);
  const fat = Math.round(nutriments.fat_100g || 0);
  const ingredientsText = prod.ingredients_text || "Ingredients list not available for this product.";

  Swal.fire({
    title: name,
    html: `
      <div class="text-left space-y-4">
        <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
          <img src="${img}" class="w-20 h-20 object-contain rounded-lg bg-white p-1" />
          <div>
            <p class="text-xs font-bold text-emerald-600">${brand}</p>
            <p class="font-bold text-gray-900">${name}</p>
            <p class="text-xs text-gray-500">Barcode: ${prod.code || "N/A"}</p>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2 text-center bg-gray-50 p-3 rounded-xl">
          <div>
            <p class="text-xs text-gray-500">Calories</p>
            <p class="font-bold text-emerald-600">${kcal}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Protein</p>
            <p class="font-bold text-blue-600">${protein}g</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Carbs</p>
            <p class="font-bold text-amber-600">${carbs}g</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Fat</p>
            <p class="font-bold text-purple-600">${fat}g</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-700 mb-1">Ingredients:</p>
          <p class="text-xs text-gray-600 max-h-24 overflow-y-auto bg-gray-50 p-2 rounded-lg">${ingredientsText}</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Servings (100g each)</label>
          <input id="swal-prod-servings" type="number" min="0.5" step="0.5" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-plus mr-1"></i> Add to Food Log',
    confirmButtonColor: "#10b981",
    preConfirm: () => {
      return parseFloat(document.getElementById("swal-prod-servings").value) || 1;
    },
  }).then((res) => {
    if (res.isConfirmed) {
      const servings = res.value;
      appState.addFoodItem({
        name: `${name} (${brand})`,
        image: img,
        type: "Product",
        servings: servings,
        calories: kcal * servings,
        protein: protein * servings,
        carbs: carbs * servings,
        fat: fat * servings,
      });

      Swal.fire({
        icon: "success",
        title: "Product Logged!",
        text: `${name} added to your Daily Food Log.`,
        timer: 1600,
        showConfirmButton: false,
      });
    }
  });
};

searchProductBtn.addEventListener("click", handleProductSearch);
productSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleProductSearch();
});

lookupBarcodeBtn.addEventListener("click", handleBarcodeLookup);
barcodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleBarcodeLookup();
});

nutriScoreBtns.forEach(function (btn) {
  btn.addEventListener("click", () => {
    selectedNutriGrade = btn.getAttribute("data-grade") || "";
    nutriScoreBtns.forEach((b) => b.classList.remove("ring-2", "ring-gray-900"));
    btn.classList.add("ring-2", "ring-gray-900");
    displayProducts();
  });
});

productCategoryBtns.forEach(function (btn) {
  btn.addEventListener("click", async () => {
    const categoryName = btn.textContent.trim().toLowerCase();
    productsGrid.innerHTML = getLoadingSpinner();
    productsCount.innerHTML = `Loading ${categoryName}...`;
    allProducts = await api.getProductsByCategory(categoryName);
    displayProducts();
  });
});
// ============= PRODUCT SCANNER END =============

// ============= FOOD LOG PAGE START =============
function displayFoodLog() {
  foodlogDate.innerHTML = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const totals = appState.getTodayTotals();
  const goals = appState.dailyGoals;
  const items = appState.getTodayItems();

  const progressCards = foodlogTodaySection.querySelectorAll(".grid > div");
  const metrics = [
    { current: totals.calories, goal: goals.calories, unit: "kcal" },
    { current: totals.protein, goal: goals.protein, unit: "g" },
    { current: totals.carbs, goal: goals.carbs, unit: "g" },
    { current: totals.fat, goal: goals.fat, unit: "g" },
  ];

  progressCards.forEach(function (card, idx) {
    const m = metrics[idx];
    const pct = Math.min(100, Math.round((m.current / m.goal) * 100));
    const textSpan = card.querySelectorAll("span")[1];
    const barDiv = card.querySelector(".h-2\\.5 > div");
    if (textSpan) textSpan.innerHTML = `${m.current} / ${m.goal} ${m.unit}`;
    if (barDiv) barDiv.style.width = `${pct}%`;
  });

  const countHeading = foodlogTodaySection.querySelector("h4");
  if (countHeading) {
    countHeading.innerHTML = `Logged Items (${items.length})`;
  }
  clearFoodlogBtn.style.display = items.length > 0 ? "inline-block" : "none";

  if (items.length === 0) {
    loggedItemsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>
    `;
  } else {
    let cartona = ``;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      cartona += `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover bg-white" />
            <div>
              <h5 class="font-bold text-gray-900 text-sm">${item.name}</h5>
              <p class="text-xs text-gray-500">
                ${item.servings} serving(s) • ${item.type} • ${item.time}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right text-xs">
              <p class="font-bold text-emerald-600 text-sm">${item.calories} kcal</p>
              <p class="text-gray-500">P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g</p>
            </div>
            <button
              onclick="deleteFoodLogItem('${item.id}')"
              class="text-gray-400 hover:text-red-500 p-2 transition-colors"
              title="Delete item"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }

    
    loggedItemsList.innerHTML = cartona;
  }

  renderWeeklyChart();
}

window.deleteFoodLogItem = function (id) {
  appState.removeFoodItem(id);
  displayFoodLog();
};

clearFoodlogBtn.addEventListener("click", () => {
  Swal.fire({
    title: "Clear Today's Log?",
    text: "All logged meals and products for today will be removed.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Yes, clear all",
  }).then((res) => {
    if (res.isConfirmed) {
      appState.clearTodayLog();
      displayFoodLog();
    }
  });
});

function renderWeeklyChart() {
  if (typeof Plotly === "undefined") return;
  const weekData = appState.getLast7DaysSummary();
  weeklyChartContainer.innerHTML = "";

  const traceCalories = {
    x: weekData.map((d) => d.label),
    y: weekData.map((d) => d.calories),
    type: "bar",
    name: "Calories (kcal)",
    marker: { color: "#10b981", borderRadius: 6 },
  };

  const layout = {
    margin: { t: 20, r: 20, b: 35, l: 45 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    yaxis: { title: "kcal", gridcolor: "#e5e7eb" },
    height: 240,
  };

  Plotly.newPlot(weeklyChartContainer, [traceCalories], layout, {
    responsive: true,
    displayModeBar: false,
  });
}

if (quickLogBtns.length >= 3) {
  quickLogBtns[0].addEventListener("click", () => switchPage("home"));
  quickLogBtns[1].addEventListener("click", () => switchPage("scanner"));
  quickLogBtns[2].addEventListener("click", () => {
    Swal.fire({
      title: "Add Custom Food Entry",
      html: `
        <div class="space-y-3 text-left">
          <input id="custom-name" type="text" placeholder="Food Name (e.g., Boiled Eggs)" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
          <div class="grid grid-cols-2 gap-2">
            <input id="custom-cal" type="number" placeholder="Calories (kcal)" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            <input id="custom-pro" type="number" placeholder="Protein (g)" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            <input id="custom-carb" type="number" placeholder="Carbs (g)" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            <input id="custom-fat" type="number" placeholder="Fat (g)" class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Add Entry",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const name = document.getElementById("custom-name").value.trim();
        if (!name) {
          Swal.showValidationMessage("Please enter a food name");
          return false;
        }
        return {
          name,
          calories: Number(document.getElementById("custom-cal").value) || 0,
          protein: Number(document.getElementById("custom-pro").value) || 0,
          carbs: Number(document.getElementById("custom-carb").value) || 0,
          fat: Number(document.getElementById("custom-fat").value) || 0,
        };
      },
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        appState.addFoodItem({
          ...res.value,
          type: "Custom",
          servings: 1,
        });
        displayFoodLog();
      }
    });
  });
}
// ============= FOOD LOG PAGE END =============

// ============= INITIALIZE APP =============
const initialHash = window.location.hash.replace("#", "");
switchPage(["home", "scanner", "foodlog"].includes(initialHash) ? initialHash : "home", false);
initHomePage();