// ==========================================
// CHEF'S FAVOURITE MEALS
// ==========================================

// SESSION STORAGE KEYS

const ORDERS_KEY = "chefOrders";
const LAST_ORDER_KEY = "lastOrderNumber";

// GET HTML ELEMENTS

const orderForm = document.getElementById("orderForm");
const ingredientInput = document.getElementById("ingredient");
const orderMessage = document.getElementById("orderMessage");
const selectedMeal = document.getElementById("selectedMeal");
const orderList = document.getElementById("orderList");

const completeForm = document.getElementById("completeForm");
const orderNumberInput = document.getElementById("orderNumber");
const completeMessage = document.getElementById("completeMessage");

const orderButton = document.getElementById("orderButton");


// ==========================================
// SESSION STORAGE FUNCTIONS
// ==========================================

// Retrieve all orders from sessionStorage

function getOrders() {

    const storedOrders = sessionStorage.getItem(ORDERS_KEY);

    if (!storedOrders) {
        return [];
    }

    try {
        const orders = JSON.parse(storedOrders);

        return Array.isArray(orders) ? orders : [];

    } catch (error) {

        console.error("Could not read stored orders:", error);
        return [];
    }
}


// Save orders as one JSON array

function saveOrders(orders) {

    sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}


// ==========================================
// DISPLAY INCOMPLETE ORDERS
// ==========================================

function displayOrders() {

    const orders = getOrders();

    // Select only incomplete orders

    const incompleteOrders = orders.filter(function(order) {
        return order.completed === false;
    });

    // Clear previous list

    orderList.replaceChildren();

    if (incompleteOrders.length === 0) {

        const message = document.createElement("p");

        message.textContent = "No outstanding orders.";
        message.className = "empty-message";

        orderList.appendChild(message);

        return;
    }

    // Display each incomplete order

    incompleteOrders.forEach(function(order) {

        const orderItem = document.createElement("div");

        orderItem.className = "order-item";

        const number = document.createElement("strong");
        number.textContent = "Order #" + order.orderNumber;

        const description = document.createElement("p");
        description.textContent = order.description;

        orderItem.appendChild(number);
        orderItem.appendChild(description);

        orderList.appendChild(orderItem);
    });
}


// ==========================================
// CREATE A NEW ORDER
// ==========================================

function createOrder(mealName) {

    const orders = getOrders();

    // Get the last generated order number

    let lastOrderNumber = Number(
        sessionStorage.getItem(LAST_ORDER_KEY)
    ) || 0;

    // Recover the highest existing number if necessary

    const highestExistingNumber = orders.reduce(function(highest, order) {
        return Math.max(highest, Number(order.orderNumber) || 0);
    }, 0);

    lastOrderNumber = Math.max(lastOrderNumber, highestExistingNumber);

    // Generate a unique order number

    const newOrderNumber = lastOrderNumber + 1;

    // Create the order object

    const newOrder = {

        description: mealName,

        orderNumber: newOrderNumber,

        completed: false

    };

    // Add the order to the collection

    orders.push(newOrder);

    // Save the updated orders

    saveOrders(orders);

    // Save the last generated order number separately

    sessionStorage.setItem(
        LAST_ORDER_KEY,
        newOrderNumber
    );

    return newOrder;
}


// ==========================================
// FETCH MEALS FROM THE MEALDB API
// ==========================================

async function findMeal(ingredient) {

    try {

        // Convert ingredient to API format

        const formattedIngredient = ingredient
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        // Build the API URL

        const apiURL =
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(formattedIngredient)}`;

        // Fetch data from TheMealDB

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("The API request failed.");
        }

        const data = await response.json();

        // Check if the API returned null

        if (!data.meals || data.meals.length === 0) {

            orderMessage.textContent =
                "Sorry, no meals found! Please try another ingredient.";

            orderMessage.className = "message error";

            ingredientInput.focus();

            return;
        }

        // Randomly select a meal

        const randomIndex = Math.floor(
            Math.random() * data.meals.length
        );

        const chosenMeal = data.meals[randomIndex];

        // Create a new order

        const newOrder = createOrder(chosenMeal.strMeal);

        
// Display selected meal
chosenMeal.strMealThumb 
selectedMeal.replaceChildren();

// Create meal image

const mealImage = document.createElement("img");

mealImage.src = chosenMeal.strMealThumb;
mealImage.alt = chosenMeal.strMeal;
mealImage.loading = "lazy";

// Create meal heading

const mealHeading = document.createElement("h3");
mealHeading.textContent = chosenMeal.strMeal;

// Create order description

const orderDescription = document.createElement("p");

orderDescription.textContent =
    "Your order number is: #" + newOrder.orderNumber;

// Create order status

const status = document.createElement("p");
status.textContent = "Status: Incomplete";

// Add everything to the selected meal section

selectedMeal.appendChild(mealImage);
selectedMeal.appendChild(mealHeading);
selectedMeal.appendChild(orderDescription);
selectedMeal.appendChild(status);


        // Success message

        orderMessage.textContent =
            "Your meal has been ordered successfully!";

        orderMessage.className = "message success";

        // Refresh outstanding orders

        displayOrders();

        // Clear ingredient input

        ingredientInput.value = "";

    } catch (error) {

        console.error("Error:", error);

        orderMessage.textContent =
            "Something went wrong. Please check your internet connection and try again.";

        orderMessage.className = "message error";

    }
}


// ==========================================
// PLACE ORDER EVENT LISTENER
// ==========================================

orderForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const ingredient = ingredientInput.value.trim();

    if (ingredient === "") {

        orderMessage.textContent =
            "Please enter an ingredient.";

        orderMessage.className = "message error";

        return;
    }

    // Prevent repeated submissions while fetching

    orderButton.disabled = true;
    orderButton.textContent = "Finding meal...";

    await findMeal(ingredient);

    orderButton.disabled = false;
    orderButton.textContent = "Find My Meal";

});


// ==========================================
// COMPLETE AN ORDER
// ==========================================

completeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const orderNumber = Number(orderNumberInput.value);

    // Entering zero means skip

    if (orderNumber === 0) {

        completeMessage.textContent =
            "No order was completed.";

        completeMessage.className = "message";

        orderNumberInput.value = "";

        return;
    }

    // Validate the order number

    if (!Number.isInteger(orderNumber) || orderNumber < 0) {

        completeMessage.textContent =
            "Please enter a valid order number.";

        completeMessage.className = "message error";

        return;
    }

    // Retrieve orders

    const orders = getOrders();

    // Find the selected order

    const selectedOrder = orders.find(function(order) {

        return Number(order.orderNumber) === orderNumber;

    });

    // Check if order exists

    if (!selectedOrder) {

        completeMessage.textContent =
            "Order #" + orderNumber + " does not exist.";

        completeMessage.className = "message error";

        return;
    }

    // Check if already completed

    if (selectedOrder.completed === true) {

        completeMessage.textContent =
            "This order has already been completed.";

        completeMessage.className = "message error";

        return;
    }

    // Update completion status

    selectedOrder.completed = true;

    // Save updated orders to sessionStorage

    saveOrders(orders);

    // Display success message

    completeMessage.textContent =
        "Order #" + orderNumber + " has been completed successfully!";

    completeMessage.className = "message success";

    // Clear input

    orderNumberInput.value = "";

    // Refresh incomplete orders

    displayOrders();

});


// ==========================================
// INITIALISE APPLICATION
// ==========================================

// Display saved incomplete orders when page loads

displayOrders();

console.log("Chef's Favourite Meals application is running!");
