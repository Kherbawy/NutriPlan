// src/js/api/mealdb.js

export class NutriPlanAPI {
  constructor() {
    this.mealBaseUrl = "https://www.themealdb.com/api/json/v1/1";
    this.nutritionUrl = "https://nutriplan-api.vercel.app/api/nutrition/analyze";
    this.apiKey = "xRGnhxcXrKuX8hJpeeQE5Rac9b7dyQDpaMs5fWFL";
    this.openFoodBaseUrl = "https://world.openfoodfacts.org";
  }

  async getCategories() {
    const response = await fetch(`${this.mealBaseUrl}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  }

  async getAreas() {
    const response = await fetch(`${this.mealBaseUrl}/list.php?a=list`);
    const data = await response.json();
    return data.meals || [];
  }

  async searchMeals(query = "chicken") {
    const response = await fetch(
      `${this.mealBaseUrl}/search.php?s=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.meals ? data.meals.slice(0, 25) : [];
  }

  async filterByCategory(category) {
    const response = await fetch(
      `${this.mealBaseUrl}/filter.php?c=${encodeURIComponent(category)}`
    );
    const data = await response.json();
    return data.meals ? data.meals.slice(0, 25) : [];
  }

  async filterByArea(area) {
    const response = await fetch(
      `${this.mealBaseUrl}/filter.php?a=${encodeURIComponent(area)}`
    );
    const data = await response.json();
    return data.meals ? data.meals.slice(0, 25) : [];
  }

  async getMealById(id) {
    const response = await fetch(`${this.mealBaseUrl}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  }

  async analyzeNutrition(recipeName, ingredients) {
    try {
      const response = await fetch(this.nutritionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          recipeName: recipeName,
          ingredients: ingredients,
        }),
      });
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Nutrition API Error:", error);
      return null;
    }
  }

  async searchProducts(query) {
    const response = await fetch(
      `${this.openFoodBaseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&page=1&page_size=24&json=1`
    );
    const data = await response.json();
    return data.products || [];
  }

  async getProductByBarcode(barcode) {
    const response = await fetch(
      `${this.openFoodBaseUrl}/api/v0/product/${encodeURIComponent(barcode)}.json`
    );
    const data = await response.json();
    return data.status === 1 ? data.product : null;
  }

  async getProductsByCategory(categorySlug) {
    const response = await fetch(
      `${this.openFoodBaseUrl}/category/${encodeURIComponent(
        categorySlug
      )}.json?page=1&page_size=24`
    );
    const data = await response.json();
    return data.products || [];
  }
}
