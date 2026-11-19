# Smart Expense Tracker

A full-stack web application for managing and tracking personal expenses.

## Features

- Add expenses
- Edit expenses
- Delete expenses
- View all expenses
- Filter expenses by category
- Filter expenses by month
- Sort expenses
- View total spending
- View number of expenses
- Category-wise spending summary
- Monthly expense reports
- Monthly budget tracking
- Budget warnings
- Monthly, daily, and category spending charts
- Dark mode
- Responsive design
- Download monthly expense report as PDF

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MySQL
- Chart.js
- jsPDF

## Database

The application uses MySQL with a database named:

`SmartExpenseTracker`

The database password is stored in a `.env` file and is not included in this repository.

## How to Run

1. Clone the repository.
2. Install dependencies:

```bash
npm install

## 🐳 Running with Docker (Recommended)

This project is fully containerized using **Docker** and **Docker Compose**, allowing you to run both the Node.js backend and MySQL database seamlessly without installing MySQL locally.

### Prerequisites
* [Docker Desktop](https://docker.com) installed and running on your machine.

### Setup & Run
1. Clone the repository:
   ```bash
   git clone <your-github-repo-link>
   cd <your-project-folder>
   ```

2. Create a `.env` file in the root directory and add your database credentials:
   ```env
   DB_PASSWORD=your_secure_password
   ```

3. Build and start the containers using Docker Compose:
   ```bash
   docker compose up --build
   ```

4. The server will start running on `http://localhost:3000`.

## 🌐 Live Demo
Check out the live deployed application here: **[Smart Expense Tracker Live](https://smart-expense-tracker-h958.onrender.com)**
*(Note: Hosted on Render Free Tier — initial load may take 30–40 seconds if the server is waking up from sleep).*
