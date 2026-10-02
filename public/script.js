let allExpenses = [];
let editId = null;
let monthlyChart = null;
let categoryChart = null;
let dailyChart = null;
let monthlyReportData = {};

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;
    document.getElementById("save-budget").addEventListener("click", function() {

    const budgetInput =
        document.getElementById("monthly-budget");

    const budget = Number(budgetInput.value);

    if (budget <= 0 || budgetInput.value === "") {
        alert("Please enter a valid budget.");
        return;
    }

    monthlyBudget = budget;
    localStorage.setItem("monthlyBudget", monthlyBudget);

updateBudgetSummary();

alert("Monthly budget saved successfully!");
});
function updateBudgetSummary() {

    const today = new Date();

const currentMonth =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0");

    let spent = 0;

allExpenses.forEach(function(expense) {
        const expenseMonth =
            String(expense.expense_date).substring(0, 7);

        if (expenseMonth === currentMonth) {
            spent += Number(expense.amount);
        }
    });

    const remaining = monthlyBudget - spent;
    const warning = document.getElementById("budget-warning");

warning.innerHTML = "";

if (spent > monthlyBudget && monthlyBudget > 0) {

    warning.innerHTML =
        "<p class='budget-exceeded'>You have exceeded your monthly budget!</p>";

} else if (spent >= monthlyBudget && monthlyBudget > 0) {

    warning.innerHTML =
        "<p class='budget-alert'>You have reached your monthly budget!</p>";

} else if (spent >= monthlyBudget * 0.8 && monthlyBudget > 0) {

    warning.innerHTML =
        "<p class='budget-alert'>Warning: You have used 80% of your monthly budget!</p>";

}
    document.getElementById("budget-summary").innerHTML =
        "<p>Monthly Budget: ₹" + monthlyBudget.toFixed(2) + "</p>" +
        "<p>Amount Spent: ₹" + spent.toFixed(2) + "</p>" +
        "<p>Remaining Budget: ₹" + remaining.toFixed(2) + "</p>";
}

const form = document.getElementById("expense-form");


// ====================
// ADD / UPDATE EXPENSE
// ====================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value;
    const expense_date = document.getElementById("expense_date").value;

    if (!amount || Number(amount) <= 0) {
        alert("Please enter an amount greater than 0");
        return;
    }

    if (!category) {
        alert("Please enter a category");
        return;
    }

    if (!expense_date) {
        alert("Please select an expense date");
        return;
    }

    const expense = {
        amount: amount,
        category: category,
        description: description,
        expense_date: expense_date
    };

    let url = "/expenses";
    let method = "POST";

    if (editId !== null) {
        url = "/expenses/" + editId;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expense)
    })
    .then(function(response) {

        if (!response.ok) {
            return response.json().then(function(data) {
                throw new Error(data.message);
            });
        }

        return response.json();
    })
    .then(function(data) {

        alert(data.message);

        editId = null;

        document.querySelector("#expense-form button").textContent =
            "Add Expense";

        document.getElementById("cancel-edit").style.display =
            "none";

        form.reset();

        loadExpenses();
    })
    .catch(function(error) {

        console.error(error);
        alert(error.message);
    });
});


// ====================
// LOAD EXPENSES
// ====================

function loadExpenses() {

    fetch("/expenses")
    .then(function(response) {

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        return response.json();
    })
    .then(function(data) {
        allExpenses = data;
        updateBudgetSummary();

        const categoryFilter =
            document.getElementById("category-filter");

        const monthFilter =
            document.getElementById("month-filter");

        const selectedCategory =
            categoryFilter.value;

        const selectedMonth =
            monthFilter.value;

        const selectedSort =
            document.getElementById("sort-expenses").value;
        // ====================
// MONTHLY EXPENSE REPORT
// ====================

const monthlyTotals = {};
const dailyTotals = {};
let thisMonthTotal = 0;
let totalMonthlySpending = 0;
let numberOfMonths = 0;


const currentMonth =
    new Date().toISOString().substring(0, 7);

data.forEach(function(expense) {

    const month =
        String(expense.expense_date).substring(0, 7);

    if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
    }

    monthlyTotals[month] += Number(expense.amount);
    const day = String(expense.expense_date).substring(0, 10);

if (!dailyTotals[day]) {
    dailyTotals[day] = 0;
}

dailyTotals[day] += Number(expense.amount);
});


        // ====================
        // CATEGORY DROPDOWN
        // ====================

        const categories = [];

        data.forEach(function(expense) {

            if (!categories.includes(expense.category)) {
                categories.push(expense.category);
            }
        });

        categories.forEach(function(category) {

            let exists = false;

            for (let i = 0; i < categoryFilter.options.length; i++) {

                if (categoryFilter.options[i].value === category) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {

                const option = document.createElement("option");

                option.value = category;
                option.textContent = category;

                categoryFilter.appendChild(option);
            }
        });


        // ====================
        // MONTH DROPDOWN
        // ====================

        const months = [];

        data.forEach(function(expense) {

            const month =
                String(expense.expense_date).substring(0, 7);
                if (month === currentMonth) {
    thisMonthTotal += Number(expense.amount);
}

            if (!months.includes(month)) {
                months.push(month);
            }
        });

        months.forEach(function(month) {

            let exists = false;

            for (let i = 0; i < monthFilter.options.length; i++) {

                if (monthFilter.options[i].value === month) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {

                const option = document.createElement("option");

                option.value = month;

                const date = new Date(month + "-01");

                option.textContent =
                    date.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric"
                    });

                monthFilter.appendChild(option);
            }
        });


        // ====================
        // SORTING
        // ====================

        if (selectedSort === "newest") {

            data.sort(function(a, b) {
                return new Date(b.expense_date) -
                       new Date(a.expense_date);
            });

        } else if (selectedSort === "oldest") {

            data.sort(function(a, b) {
                return new Date(a.expense_date) -
                       new Date(b.expense_date);
            });

        } else if (selectedSort === "highest") {

            data.sort(function(a, b) {
                return Number(b.amount) -
                       Number(a.amount);
            });

        } else if (selectedSort === "lowest") {

            data.sort(function(a, b) {
                return Number(a.amount) -
                       Number(b.amount);
            });
        }


        // ====================
        // VARIABLES
        // ====================

        let total = 0;
        let count = 0;

        const categoryTotals = {};
        let highestCategory = "None";
let highestAmount = 0;

        const expenseList =
            document.getElementById("expense-list");

        expenseList.innerHTML = "";


        // ====================
        // DISPLAY EXPENSES
        // ====================

        data.forEach(function(expense) {

            const expenseMonth =
                String(expense.expense_date).substring(0, 7);


            // Category filter
            if (
                selectedCategory !== "all" &&
                expense.category !== selectedCategory
            ) {
                return;
            }


            // Month filter
            if (
                selectedMonth !== "all" &&
                expenseMonth !== selectedMonth
            ) {
                return;
            }


            // Total
            total += Number(expense.amount);

            // Count
            count++;


            // Category total
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }

            categoryTotals[expense.category] +=
                Number(expense.amount);
let category = expense.category.trim().toLowerCase();
let categoryIcon = "💰";
if (category === "food") {
    categoryIcon = "🍔";
} else if (category === "travel") {
    categoryIcon = "✈️";
} else if (category === "shopping") {
    categoryIcon = "🛍️";
} else if (category === "education") {
    categoryIcon = "📚";
} else if (category === "bills") {
    categoryIcon = "🧾";
}
else if (category === "entertainment") {
    categoryIcon = "🎬";
} else if (category === "health") {
    categoryIcon = "💊";
} else if (category === "rent") {
    categoryIcon = "🏠";
} else if (category  === "fuel") {
    categoryIcon = "⛽";
}

            // Expense card
            expenseList.innerHTML +=
                '<div class="expense-card">' +

            '<span class="category-badge">' +
                categoryIcon + ' ' +
            expense.category +
                '</span>' +
                '<br>' +
                '<strong>Amount:</strong> ₹' +
                expense.amount +
                '<br>' +

                '<strong>Description:</strong> ' +
                (expense.description || "") +
                '<br>' +

                '<strong>Date:</strong> ' +
                formatDate(expense.expense_date) +
                '<br>' +

                '<button class="edit-btn" ' +
                'onclick="editExpense(' +
                expense.expense_id +
                ')">Edit</button>' +

                '<button class="delete-btn" ' +
                'onclick="deleteExpense(' +
                expense.expense_id +
                ')">Delete</button>' +

                '</div>';
        });


        // ====================
        // SUMMARY
        // ====================

        document.getElementById("total-expenses").textContent =
            "Total Expenses: ₹" + total;

        document.getElementById("expense-count").textContent =
            "Number of Expenses: " + count;

        document.getElementById("this-month-total").textContent =
    "₹" + thisMonthTotal.toFixed(2);
        // ====================
        // NO EXPENSES
        // ====================

        if (count === 0) {

            expenseList.innerHTML =
                "<p>No expenses found.</p>";
        }


        // ====================
        // CATEGORY SUMMARY
        // ====================

        const categorySummary =
            document.getElementById("category-summary");

        categorySummary.innerHTML = "";

        if (total > 0) {

            for (const category in categoryTotals) {
                let summaryIcon = "💰";

if (category.trim().toLowerCase() === "food") {
    summaryIcon = "🍔";
} else if (category.trim().toLowerCase() === "travel") {
    summaryIcon = "✈️";
} else if (category.trim().toLowerCase() === "shopping") {
    summaryIcon = "🛍️";
} else if (category.trim().toLowerCase() === "education") {
    summaryIcon = "📚";
} else if (category.trim().toLowerCase() === "bills") {
    summaryIcon = "🧾";
} else if (category.trim().toLowerCase() === "entertainment") {
    summaryIcon = "🎬";
} else if (category.trim().toLowerCase() === "health") {
    summaryIcon = "💊";
} else if (category.trim().toLowerCase() === "rent") {
    summaryIcon = "🏠";
} else if (category.trim().toLowerCase() === "fuel") {
    summaryIcon = "⛽";
}
                const percentage =
                    (categoryTotals[category] / total) * 100;

categorySummary.innerHTML +=
    '<div class="expense-card">' +
'<span class="category-badge">' +
summaryIcon + ' ' +
category +
'</span> ' +
'₹' + categoryTotals[category] +
    ' (' + percentage.toFixed(1) + '%)' +
    '</div>';            }
        }
        for (const category in categoryTotals) {

    if (categoryTotals[category] > highestAmount) {
        highestAmount = categoryTotals[category];
        highestCategory = category;
    }
}

document.getElementById("highest-category").textContent =
    highestCategory;
        // ====================
// CATEGORY PIE CHART
// ====================

const categoryLabels = Object.keys(categoryTotals);

const categoryValues = categoryLabels.map(function(category) {
    return categoryTotals[category];
});

const categoryCtx =
    document.getElementById("categoryChart");

if (categoryChart !== null) {
    categoryChart.destroy();
}

categoryChart = new Chart(categoryCtx, {
    type: "pie",

    data: {
        labels: categoryLabels,

        datasets: [{
            label: "Category Spending",
            data: categoryValues
        }]
    },

    options: {
        responsive: true
    }
});
        // ====================
// DISPLAY MONTHLY REPORT
// ====================

const monthlySummary =
    document.getElementById("monthly-summary");
monthlyReportData = { ...monthlyTotals };
monthlySummary.innerHTML = "";

for (const month in monthlyTotals) {
    totalMonthlySpending += monthlyTotals[month];
numberOfMonths++;

    const date = new Date(month + "-01");

    const monthName = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });

    monthlySummary.innerHTML +=
        '<div class="expense-card">' +
        '<strong>' + monthName + ':</strong> ' +
        '₹' + monthlyTotals[month] +
        '</div>';
}
let averageMonthlySpending = 0;

if (numberOfMonths > 0) {
    averageMonthlySpending =
        totalMonthlySpending / numberOfMonths;
}

document.getElementById("average-monthly").textContent =
    "₹" + averageMonthlySpending.toFixed(2);
const chartLabels = Object.keys(monthlyTotals).sort();

const chartValues = chartLabels.map(function(month) {
    return monthlyTotals[month];
});

// Daily chart data
const dailyLabels = Object.keys(dailyTotals).sort();

const dailyValues = dailyLabels.map(function(day) {
    return dailyTotals[day];
});
const displayLabels = chartLabels.map(function(month) {
    const date = new Date(month + "-01");

    return date.toLocaleString("en-US", {
        month: "short",
        year: "numeric"
    });
});

const ctx = document.getElementById("monthlyChart");

if (monthlyChart !== null) {
    monthlyChart.destroy();
}

monthlyChart = new Chart(ctx, {
    type: "bar",

    data: {
        labels: displayLabels,

        datasets: [{
            label: "Monthly Spending (₹)",
            data: chartValues
        }]
    },

    options: {
        responsive: true,

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
const dailyCtx = document.getElementById("dailyChart");

if (dailyChart !== null) {
    dailyChart.destroy();
}

dailyChart = new Chart(dailyCtx, {
    type: "bar",

    data: {
        labels: dailyLabels,

        datasets: [{
            label: "Daily Spending (₹)",
            data: dailyValues
        }]
    },

    options: {
        responsive: true,

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

    })

    .catch(function(error) {

        console.error(error);
        alert("Failed to load expenses");
    });
}


// ====================
// FORMAT DATE
// ====================

function formatDate(date) {

    const parts = String(date).substring(0, 10).split("-");

    return parts[2] + "-" + parts[1] + "-" + parts[0];
}


// ====================
// DELETE EXPENSE
// ====================

function deleteExpense(id) {

    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    fetch("/expenses/" + id, {
        method: "DELETE"
    })
    .then(function(response) {

        if (!response.ok) {

            return response.json().then(function(data) {
                throw new Error(data.message);
            });
        }

        return response.json();
    })
    .then(function(data) {

        alert(data.message);

        loadExpenses();
    })
    .catch(function(error) {

        console.error(error);
        alert(error.message);
    });
}


// ====================
// EDIT EXPENSE
// ====================

function editExpense(id) {

    editId = id;

    document.querySelector("#expense-form button").textContent =
        "Update Expense";

    document.getElementById("cancel-edit").style.display =
        "inline-block";

    fetch("/expenses/" + id)
    .then(function(response) {

        if (!response.ok) {

            return response.json().then(function(data) {
                throw new Error(data.message);
            });
        }

        return response.json();
    })
    .then(function(data) {

        const expense = data[0];

        document.getElementById("amount").value =
            expense.amount;

        document.getElementById("category").value =
            expense.category;

        document.getElementById("description").value =
            expense.description || "";

        document.getElementById("expense_date").value =
            String(expense.expense_date).substring(0, 10);
    })
    .catch(function(error) {

        console.error(error);
        alert(error.message);
    });
}


// ====================
// CANCEL EDIT
// ====================

document.getElementById("cancel-edit")
.addEventListener("click", function() {

    editId = null;

    form.reset();

    document.querySelector("#expense-form button").textContent =
        "Add Expense";

    document.getElementById("cancel-edit").style.display =
        "none";
});


// ====================
// CATEGORY FILTER
// ====================

document.getElementById("category-filter")
.addEventListener("change", function() {

    loadExpenses();
});


// ====================
// MONTH FILTER
// ====================

document.getElementById("month-filter")
.addEventListener("change", function() {

    loadExpenses();
});


// ====================
// SORT
// ====================

document.getElementById("sort-expenses")
.addEventListener("change", function() {

    loadExpenses();
});


// ====================
// LOAD WHEN PAGE OPENS
// ====================

loadExpenses();
document.getElementById("download-pdf").addEventListener("click", function() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.text("Smart Expense Tracker", 20, 20);
    doc.text("Monthly Expense Report", 20, 30);
    doc.text("Individual Expenses", 20, 40);

    let y = 55;
    allExpenses.forEach(function(expense) {

    const expenseDate =
        String(expense.expense_date).substring(0, 10);

    const expenseText =
        expenseDate + " | " +
        expense.category + " | " +
        expense.description + " | Rs. " +
        Number(expense.amount).toFixed(2);

    doc.text(expenseText, 20, y);

    y += 10;
});

    for (const month in monthlyReportData) {

        const date = new Date(month + "-01");

        const monthName = date.toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });

        doc.text(
            monthName + ": Rs. " + monthlyReportData[month],
            20,
            y
        );

        y += 10;
    }
    let grandTotal = 0;

for (const month in monthlyReportData) {
    grandTotal += Number(monthlyReportData[month]);
}

y += 10;

doc.text("Grand Total: Rs. " + grandTotal.toFixed(2), 20, y);

    doc.save("Monthly-Expense-Report.pdf");

});
// Smooth scrolling for sidebar links
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const target = document.querySelector(
            this.getAttribute("href")
        );

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});
// Toggle sidebar visibility
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", function() {
    sidebar.classList.toggle("sidebar-hidden");
});
// Dark mode toggle
const themeToggle = document.getElementById("theme-toggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});