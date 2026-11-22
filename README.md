#### Smart Expense Tracker

A full-stack web application for personal expense management built with **Node.js, Express, MySQL, Distributed Redis Caching, and Docker**. 

#### 🌐 Live Demo

* **[Smart Expense Tracker Live](https://smart-expense-tracker-h958.onrender.com)** *(Note: Hosted on Render Free Tier; initial load may take 30–40 seconds).*

#### ✨ Key Features

* **Expense Management & Analytics:** Add, edit, delete, and filter expenses, set monthly budgets with warnings, view interactive spending charts, and download PDF reports.
* **High-Performance Caching & UI:** Sub-millisecond API responses via **Redis** (Cache-Aside pattern) alongside a responsive layout with Dark Mode.

#### 🏗️ System Architecture & Caching Strategy

* **Cache Hit / Miss & TTL:** Queries **Upstash Redis** first for sub-millisecond responses; on a miss, fetches from **Aiven Cloud MySQL** and caches data with a **60-second TTL**.
* **Invalidation & Fallback:** Write operations (POST, PUT, DELETE) automatically purge (DEL) the cached key, with built-in fallback to MySQL if Redis is unreachable.

#### 🛠️ Tech Stack

* **Frontend / Backend:** HTML, CSS, JS, Chart.js, jsPDF | Node.js, Express.js
* **Database, Caching & DevOps:** MySQL (Aiven Cloud), Redis (Upstash Cloud), Docker, Docker Compose, Render

#### 🐳 Quick Start (Docker - Recommended)

1. **Clone the repository:** 

bash

git clone https://github.com/Ramsha162006/Smart-Expense-Tracker.git
cd Smart-Expense-Tracker

Use code with caution.

Copy code text to clipboard.
2. **Create .env** and add DB_PASSWORD=your_secure_password.
3. **Build and run:** 

bash

docker compose up --build

Use code with caution.

Copy code text to clipboard.

Access at http://localhost:3000.

#### 💻 Manual Setup (Without Docker)

1. Run npm install and configure .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, REDIS_URL).
2. Start the server: node server.js

**Author:** Ramsha