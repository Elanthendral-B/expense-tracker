"use strict";

const expenseForm = document.getElementById("expenseForm");

const expenseNameInput = document.getElementById("expenseName");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");
const expenseTable = document.getElementById("expenseTable");
const emptyState = document.getElementById("emptyState");

const totalAmount = document.getElementById("totalAmount");
const transactionCount = document.getElementById("transactionCount");
const averageAmount = document.getElementById("averageAmount");

const filterCategory = document.getElementById("filterCategory");


// Load expenses from LocalStorage

let expenses = loadExpenses();


// Set today's date

function setTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}


// Load LocalStorage

function loadExpenses() {
    try {
        const savedExpenses = localStorage.getItem("expenseTrackerData");

        if (!savedExpenses) {
            return [];
        }

        const parsedExpenses = JSON.parse(savedExpenses);

        return Array.isArray(parsedExpenses) ? parsedExpenses : [];

    } catch (error) {
        console.error("Unable to load expenses:", error);

        return [];
    }
}


// Save expenses

function saveExpenses() {
    localStorage.setItem(
        "expenseTrackerData",
        JSON.stringify(expenses)
    );
}


// Format currency

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(value);
}


// Format date

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Escape HTML

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// Generate unique ID

function generateId() {
    return Date.now().toString() + Math.random()
        .toString(16)
        .slice(2);
}


// Add Expense

expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = expenseNameInput.value.trim();

    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;


    if (!name) {
        alert("Please enter an expense name.");

        expenseNameInput.focus();

        return;
    }


    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");

        amountInput.focus();

        return;
    }


    if (!category) {
        alert("Please select a category.");

        categoryInput.focus();

        return;
    }


    if (!date) {
        alert("Please select a date.");

        dateInput.focus();

        return;
    }


    const newExpense = {
        id: generateId(),
        name: name,
        amount: amount,
        category: category,
        date: date
    };


    expenses.unshift(newExpense);

    saveExpenses();

    expenseForm.reset();

    setTodayDate();

    filterCategory.value = "All";

    renderExpenses();

    expenseNameInput.focus();
});


// Delete Expense

function deleteExpense(id) {

    const expense = expenses.find(
        item => item.id === id
    );


    if (!expense) {
        return;
    }


    const shouldDelete = confirm(
        `Delete "${expense.name}" expense?`
    );


    if (!shouldDelete) {
        return;
    }


    expenses = expenses.filter(
        item => item.id !== id
    );


    saveExpenses();

    renderExpenses();
}


// Filter expenses

filterCategory.addEventListener("change", function () {
    renderExpenses();
});


// Render expenses

function renderExpenses() {

    const selectedCategory = filterCategory.value;


    let filteredExpenses = expenses;


    if (selectedCategory !== "All") {

        filteredExpenses = expenses.filter(
            expense => expense.category === selectedCategory
        );

    }


    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        expenseTable.style.display = "none";

        emptyState.style.display = "block";

    } else {

        expenseTable.style.display = "table";

        emptyState.style.display = "none";


        filteredExpenses.forEach(expense => {

            const row = document.createElement("tr");


            row.innerHTML = `
                <td>
                    <div class="expense-name">
                        ${escapeHTML(expense.name)}
                    </div>
                </td>

                <td>
                    <span class="category-badge">
                        ${escapeHTML(expense.category)}
                    </span>
                </td>

                <td>
                    ${formatDate(expense.date)}
                </td>

                <td>
                    <span class="amount-text">
                        ${formatCurrency(expense.amount)}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="delete-btn"
                        title="Delete expense"
                        aria-label="Delete ${escapeHTML(expense.name)}"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;


            const deleteButton = row.querySelector(".delete-btn");


            deleteButton.addEventListener("click", function () {
                deleteExpense(expense.id);
            });


            expenseList.appendChild(row);

        });

    }


    updateSummary();
}


// Update summary

function updateSummary() {

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );


    const count = expenses.length;


    const average = count > 0
        ? total / count
        : 0;


    totalAmount.textContent = formatCurrency(total);

    transactionCount.textContent = count;

    averageAmount.textContent = formatCurrency(average);
}


// Initialize application

setTodayDate();

renderExpenses();