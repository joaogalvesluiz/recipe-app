
const mealsEl = document.querySelector("#meals");
const favoriteContainer = document.querySelector("#fav-meals");
const searchTerm = document.querySelector("#search-term");
const searchBtn = document.querySelector("#search");
const mealPopup = document.querySelector("#meal-popup");
const mealElInfo = document.querySelector("#meal-info");
const popupCloseBtn = document.querySelector("#close-popup");

getRandomMeal();
fetchFavMeals();


async function getRandomMeal() {
    //API
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    //console.log(randomMeal);

    addMeal(randomMeal, true);

};

async function getMealById(id) {
    //API
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);

    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
};

async function getMealsBySearch(term) {
    //API
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term);

    const respData = await resp.json();
    const meals = respData.meals;
    return meals;

};

function addMeal(mealData, random = false) {
    console.log(mealData);

    // Show the meal on screen
    const meal = document.createElement("div");
    meal.classList.add("meal");
    meal.innerHTML = `

        <div class="meal-header">
            ${random ? '  <span class="random"> Random Recipe </span> ' : '' }
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">   
            <h3>${mealData.strMeal}</h3>                
            <button class="fav-btn">
                <i class="fas fa-heart"> </i>
            </button>
        </div>
    `;

    //Clicking to favorite the meal
    const btn = meal.querySelector(".meal-body .fav-btn");

    //Mark favorite
    btn.addEventListener("click", () => {

        //check if already active
        if(btn.classList.contains("active")) {
            //remove
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            //add
            addMealtoLocalStorage(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();

    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    meals.appendChild(meal);
};

function addMealtoLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));  
};

function removeMealFromLocalStorage(mealId) {

    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId)) 
    );

};

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
};

//Display favorite meals
async function fetchFavMeals() {

    //Clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsFromLocalStorage();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealFav(meal);
        
    };
    
}

function addMealFav(mealData) {

    // Show the meal on screen
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear">
            <i class="fas fa-window-close"></i>
        </button>
       
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealFromLocalStorage(mealData.idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    favoriteContainer.appendChild(favMeal);
};

//Open popup with more informations about the recipe
function showMealInfo(mealData) {
    //clean
    mealElInfo.innerHTML = ""; 

    //update the meal info
    const mealEl = document.createElement("div");

    const ingredients = [];   
    //Ingredients and measure       
    for(let i = 1; i <= 20; i++) {
        if(mealData["strIngredient"+i]) {
            ingredients.push(`
                ${mealData["strIngredient"+i]} -
                ${mealData["strMeasure"+i]}
            `);
        } else {
            break;
        }
    }
    
    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">

        <p>${mealData.strInstructions}</p>
        <h3>Ingredients</h3>
        <ul>
           ${ingredients.map(ing => ` <li>${ing} </li> `).join("")}

        </ul>
    `;    

    mealElInfo.appendChild(mealEl);

    //Show the popup
    mealPopup.classList.remove("hidden");
}

//Search and Display 
searchBtn.addEventListener("click", async () => {
    //clear container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

   if(meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
   }

});

//Close the Details PopUp meal
popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});
