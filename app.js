
// ==========================================
// CHEF'S FAVOURITE MEALS
// TheMealDB API + Fetch + sessionStorage
// ==========================================


// ==========================================
// 1. STORAGE KEYS
// ==========================================

const ORDERS_KEY = "chefOrders";
const LAST_ORDER_KEY = "lastOrderNumber";


// ==========================================
// 2. API URL
// ==========================================

const API_URL =
    "https://www.themealdb.com/api/json/v1/1/filter.php?i=";


// ==========================================
// 3. CONNECT HTML ELEMENTS
// ==========================================

const ingredientForm =
    document.getElementById("ingredientForm");

const ingredientInput =
    document.getElementById("ingredientInput");

const searchButton =
    document.getElementById("searchButton");

const searchMessage =
    document.getElementById("searchMessage");

const mealResult =
    document.getElementById("mealResult");

const mealName =
    document.getElementById("mealName");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const ordersList =
    document.getElementById("ordersList");

const totalOrders =
    document.getElementById("totalOrders");

const lastOrder =
    document.getElementById("lastOrder");

const completeForm =
    document.getElementById("completeForm");

const orderNumberInput =
    document.getElementById("orderNumberInput");

const completionMessage =
    document.getElementById("completionMessage");


// Store the currently selected meal
let selectedMeal = null;


// ==========================================
// 4. GET ORDERS FROM SESSION STORAGE
// ==========================================

function getOrders() {

    const storedOrders =
        sessionStorage.getItem(ORDERS_KEY);

    return storedOrders
        ? JSON.parse(storedOrders)
        : [];

}


// ==========================================
// 5. SAVE ORDERS TO SESSION STORAGE
// ==========================================

function saveOrders(orders) {

    sessionStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(orders)
    );

}


// ==========================================
// 6. DISPLAY MESSAGES
// ==========================================

function showMessage(element, message, type = "") {

    element.textContent = message;

    element.className = "message " + type;

}


// ==========================================
// 7. SEARCH THE MEAL DATABASE
// ==========================================

ingredientForm.addEventListener(
    "submit",
    async function(event) {

        // Stop the form from refreshing the page
        event.preventDefault();

        // Get ingredient entered by user
        const ingredient = ingredientInput.value.trim();


        // Check for empty input
        if (!ingredient) {

            showMessage(
                searchMessage,
                "Please enter an ingredient.",
                "error"
            );

            return;

        }


        // Convert ingredient to lowercase
        // Replace spaces with underscores

        const formattedIngredient = ingredient
            .toLowerCase()
            .replace(/\s+/g, "_");


        // Create API URL

        const requestURL =
            API_URL + encodeURIComponent(formattedIngredient);


        // Disable search button while loading

        searchButton.disabled = true;
        searchButton.textContent = "Searching...";


        showMessage(
            searchMessage,
            "Searching for delicious meals..."
        );


        mealResult.hidden = true;
        placeOrderButton.hidden = true;

        selectedMeal = null;


        try {

            // FETCH API DATA

            const response = await fetch(requestURL);


            // Check response

            if (!response.ok) {

                throw new Error(
                    "Unable to connect to TheMealDB."
                );

            }


            // Convert response into JSON

            const data = await response.json();


            // CHECK FOR NULL RESULTS

            if (!data.meals || data.meals.length === 0) {

                showMessage(
                    searchMessage,
                    "No meals found for " +
                    ingredient +
                    ". Please try another ingredient!",
                    "error"
                );

                ingredientInput.value = "";
                ingredientInput.focus();

                return;

            }


            // ==================================
            // 8. RANDOMLY SELECT A MEAL
            // ==================================

            const randomIndex = Math.floor(
                Math.random() * data.meals.length
            );


            selectedMeal = data.meals[randomIndex];


            // Display the selected meal

            mealName.textContent =
                selectedMeal.strMeal;


            mealResult.hidden = false;

            placeOrderButton.hidden = false;


            showMessage(
                searchMessage,
                "Meal successfully found! Ready to place your order.",
                "success"
            );


        } catch (error) {

            // Handle errors

            showMessage(
                searchMessage,
                error.message + " Please try again.",
                "error"
            );

            console.error("API Error:", error);


        } finally {

            // Re-enable search button

            searchButton.disabled = false;

            searchButton.textContent = "Find Meals →";

        }

    }
);


// ==========================================
// 9. PLACE A NEW ORDER
// ==========================================

placeOrderButton.addEventListener(
    "click",
    function() {

        // Check selected meal

        if (!selectedMeal) {

            showMessage(
                searchMessage,
                "Please search for a meal first.",
                "error"
            );

            return;

        }


        // Retrieve existing orders

        const orders = getOrders();


        // Generate unique order number
        // Last order number + 1

        const orderNumber =
            Number(
                sessionStorage.getItem(LAST_ORDER_KEY) || 0
            ) + 1;


        // Create new order object

        const newOrder = {

            description: selectedMeal.strMeal,

            orderNumber: orderNumber,

            completed: false

        };


        // Add order to array

        orders.push(newOrder);


        // Save complete array as JSON

        saveOrders(orders);


        // Save last generated order number separately

        sessionStorage.setItem(
            LAST_ORDER_KEY,
            String(orderNumber)
        );


        // Display success message

        showMessage(
            searchMessage,
            "Order #" +
            orderNumber +
            " successfully placed!",
            "success"
        );


        // Reset selected meal

        selectedMeal = null;

        mealResult.hidden = true;

        placeOrderButton.hidden = true;

        ingredientInput.value = "";


        // Refresh outstanding orders

        displayOrders();

    }
);


// ==========================================
// 10. DISPLAY INCOMPLETE ORDERS
// ==========================================

function displayOrders() {

    // Retrieve orders

    const orders = getOrders();


    // Use FILTER to select incomplete orders

    const incompleteOrders = orders.filter(
        function(order) {

            return order.completed === false;

        }
    );


    // Clear previous list

    ordersList.replaceChildren();


    // Update statistics

    totalOrders.textContent =
        incompleteOrders.length;


    lastOrder.textContent =
        sessionStorage.getItem(LAST_ORDER_KEY) || 0;


    // Check if there are outstanding orders

    if (incompleteOrders.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "No outstanding orders yet.";

        ordersList.appendChild(emptyMessage);

        return;

    }


    // Display each incomplete order

    incompleteOrders.forEach(function(order) {

        const orderItem =
            document.createElement("div");

        orderItem.className = "order-item";


        const orderText =
            document.createElement("div");


        // Order number

        const number =
            document.createElement("strong");

        number.textContent =
            "#" + order.orderNumber;


        // Meal description

        const description =
            document.createElement("span");

        description.textContent =
            order.description;


        // Add elements together

        orderText.appendChild(number);

        orderText.appendChild(description);

        orderItem.appendChild(orderText);

        ordersList.appendChild(orderItem);

    });

}


// ==========================================
// 11. COMPLETE AN ORDER
// ==========================================

completeForm.addEventListener(
    "submit",
    function(event) {

        // Prevent page refresh

        event.preventDefault();


        // Get entered order number

        const orderNumber =
            Number(orderNumberInput.value);


        // ZERO MEANS SKIP

        if (orderNumber === 0) {

            showMessage(
                completionMessage,
                "No order selected. Nothing has been changed."
            );

            orderNumberInput.value = "";

            return;

        }


        // Validate order number

        if (
            !Number.isInteger(orderNumber) ||
            orderNumber < 0
        ) {

            showMessage(
                completionMessage,
                "Please enter a valid order number.",
                "error"
            );

            return;

        }


        // Retrieve all orders

        const orders = getOrders();


        // FIND SELECTED ORDER

        const selectedOrder = orders.find(
            function(order) {

                return order.orderNumber === orderNumber;

            }
        );


        // CHECK IF ORDER EXISTS

        if (!selectedOrder) {

            showMessage(
                completionMessage,
                "Order #" +
                orderNumber +
                " does not exist.",
                "error"
            );

            orderNumberInput.value = "";

            return;

        }


        // CHECK IF ALREADY COMPLETED

        if (selectedOrder.completed) {

            showMessage(
                completionMessage,
                "Order #" +
                orderNumber +
                " has already been completed.",
                "error"
            );

            orderNumberInput.value = "";

            return;

        }


        // UPDATE COMPLETION STATUS

        selectedOrder.completed = true;


        // SAVE UPDATED ORDERS

        saveOrders(orders);


        // DISPLAY SUCCESS MESSAGE

        showMessage(
            completionMessage,
            "Success! Order #" +
            orderNumber +
            " has been completed.",
            "success"
        );


        // Clear input

        orderNumberInput.value = "";


        // Refresh outstanding orders

        displayOrders();

    }
);


// ==========================================
// 12. INITIALISE APPLICATION
// ==========================================


// Set initial order number if it doesn't exist

if (
    sessionStorage.getItem(LAST_ORDER_KEY) === null
) {

    sessionStorage.setItem(
        LAST_ORDER_KEY,
        "0"
    );

}


// Display previously saved incomplete orders

displayOrders();


console.log(
    "Chef's Favourite Meals application loaded!"
);
