# My Wallet

**My Wallet** is a personal finance management application built with Next.js and PostgreSQL. It helps users track income and expenses, organize transactions into categories, manage monthly budgets, and monitor their overall financial activity through a visual dashboard.

## Features

### 🔐 Authentication

* User registration and login
* Password hashing with `bcryptjs`
* JWT-based authentication
* JWT stored in an HTTP-only cookie
* Protected user-specific data

### 💰 Transactions

* Create, edit, and delete income and expense transactions
* Assign transactions to categories
* Search and filter transactions
* Filter by category, transaction type, and date range

### 🏷️ Categories

* Create, edit, and delete categories
* Separate categories for income and expenses
* Use categories to organize transactions and budgets

### 📊 Budgets

* Set monthly spending limits for categories
* Track spending against budget limits
* Identify when spending reaches or exceeds a budget

### 📈 Dashboard

* View total balance
* View total income and expenses
* Visualize expenses by category
* Review budget and spending summaries
* Monitor overall account activity

## Tech Stack

### Frontend

* **Next.js 16** — App Router
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **Recharts**
* **Chart.js**
* **Lucide React**

### Backend & Database

* **Next.js Route Handlers** — API endpoints
* **PostgreSQL** — Database
* **Node PostgreSQL (`pg`)** — Database access
* **JSON Web Token (`jsonwebtoken`)** — Authentication
* **bcryptjs** — Password hashing

## Project Structure

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── budgets/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── budget/
│   │   │   └── route.ts
│   │   ├── categories/
│   │   │   └── route.ts
│   │   ├── dashboard/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── me/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   └── transactions/
│   │       └── route.ts
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
├── lib/
└── types/
```

The application uses the Next.js App Router for pages and layouts. API functionality is implemented using Route Handlers under `src/app/api`.

Reusable UI components, authentication and database utilities, and TypeScript definitions are organized into separate directories for maintainability.

## Getting Started

### Prerequisites

Before running the project, make sure you have:

* Node.js
* npm
* PostgreSQL database

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the values with your PostgreSQL connection string and a strong, randomly generated JWT secret.

### Run the Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The application will redirect users to the login page.

## Security

The application uses several security mechanisms, including:

* Password hashing with `bcryptjs`
* JWT-based authentication
* HTTP-only cookies for storing authentication tokens
* Server-side session verification
* User-specific authorization for protected API routes

For production deployments, use a strong `JWT_SECRET`, secure cookie configuration, and appropriate environment-variable management.

## Project Purpose

This project was developed to demonstrate practical full-stack development skills using **Next.js, React, TypeScript, REST-style API endpoints, PostgreSQL, authentication, and data visualization**.

