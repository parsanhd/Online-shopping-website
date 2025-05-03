🛒 MyShop - CS4092 Online Shopping Application
Overview
MyShop is a full-stack online shopping application developed for the CS4092 Database Systems course. The project features a React-based front end, a PostgreSQL backend, and a robust Express.js server that handles customer and staff operations for a digital storefront.
This project implements core e-commerce functionality including customer registration, cart management, order processing, and staff product management. It aligns with the ER model and database schema developed earlier in the course.
🎯 Features
👤 Customers
Signup, login, logout
Browse and search for products
Add/update/remove products in cart
Place orders with delivery and payment selection
Manage multiple delivery addresses
Manage multiple credit cards with associated billing addresses
🧑‍💼 Staff
Add, update, and delete products
Adjust stock quantities
View and manage product details
📁 Directory Structure
├── backend/                 # Express server and PostgreSQL database interactions
│   └── server.js
├── frontend/                # React app UI
│   ├── App.js
│   ├── apiService.js
│   ├── App.css
│   ├── Login.js
│   ├── Signup.js
│   ├── ProductManager.js
│   └── ...
├── README.md                # Project documentation
└── ER Diagram + SQL Script  # Included in project repository as separate files
🧪 Technologies Used
Frontend: React.js, Vanilla CSS
Backend: Express.js, Knex.js
Database: PostgreSQL
Session Handling: express-session
🚀 Getting Started

Clone the repository

git clone https://github.com/mindofVishesh/Website.git
cd Website

Set up PostgreSQL Database

Create a database named shopping_db
Run the provided SQL schema script to generate tables and relationships

Start Backend Server

cd backend
npm install
node server.js
⚠️ Make sure your PostgreSQL credentials in server.js match your local setup.

Start Frontend

cd frontend
npm install
npm start
Frontend will run at: http://localhost:3000
Backend will run at: http://localhost:3001
✅ Project Requirements Mapping
Requirement
Status
Customer registration/login/logout
✅ Done
Product browsing and search
✅ Done
Cart management
✅ Done
Checkout with address and card
✅ Done
Address & card CRUD
✅ Done
Staff product management
✅ Done
PostgreSQL schema + ER model
✅ Done
Delivery, stock, and order tracking
✅ Done
Demo video
🎥 https://mailuc-my.sharepoint.com/✌️/g/personal/parwanvh_mail_uc_edu/EfBaxd_3bMxIsEvuVB52pcwBHebOcqEV2hmxzV7NGGitiw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=VZi2GQ
👥 Group Contributions
Each team member has contributed across the ER modeling, schema design, backend API development, and frontend features. A PDF detailing individual contributions is also included in the submission folder.
Harsh - SQL script for database setup, Backend SQL queries
Vishesh - ER diagram, API routes, General help in frontend and backend
Sid - Frontend development
