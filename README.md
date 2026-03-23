# SideQuest

## Description:

SideQuest is a full-stack, RPG-themed web application designed to connect local adventurers (users) through a Quest Board system. Users can authenticate using a secure CNIC verification system, post local bounties (tasks/errands), socialize, and bookmark their favorite quests.

## Team Members:

Talmeez ur Rehman (Roll No. 24L-2576)
M. Yaseen Asif (Roll No. 24L-2515)
Taimur Amir (Roll No. 24L-2518)

## Tech Stack:

Backend: Node.js, Express.js
Frontend: React, Vite, Tailwind CSS (v4)
Database: SQL Server (MSSQL)

## How to Run:

Database Setup
Open SQL Server Management Studio (SSMS).
Execute the scripts found in the [database/] folder to set up the tables.

### Backend:

cd backend
npm install
npx nodemon server.js


(Make sure to copy .env.example to .env and fill in your actual database credentials before running)

### Frontend:

cd frontend
npm install
npm run dev

