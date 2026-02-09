# Library Management System

A modern, full-stack Library Management System built with Next.js, featuring real-time caching with Redis and persistence with MongoDB. This application allows students to borrow books, track fines, and view their loan history, while providing administrators with tools to manage inventory and system settings.

## 🚀 Key Features

### For Students
- **Book Search**: Fast book discovery powered by Redis caching.
- **My Loans**: View active borrowings, due dates, and accrued fines.
- **Borrowing**: Simple interface to request and borrow available books.

### For Administrators
- **Dashboard**: Overview of library statistics and active loans.
- **Inventory Management**: Add, update, or remove books from the collection.
- **System Settings**: Configure borrow periods and daily fine amounts.
- **Loan Tracking**: Monitor all transactions and manage book returns.

## 🛠 Tech Stack

- **Frontend/Backend**: [Next.js (React)](https://nextjs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose ODM
- **Caching**: [Redis](https://redis.io/) (Upstash)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: Tailwind CSS & Lucide React icons

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Connection String
- Redis (Upstash) URL and Token
- Google OAuth Credentials (for NextAuth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd my-library-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   REDIS_TOKEN=your_redis_token
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `/components`: Reusable UI components (Modals, Buttons, Layouts).
- `/lib`: Database and cache initialization logic.
- `/models`: Mongoose schemas for Books, Transactions, and Settings.
- `/pages`: Next.js pages and API routes.
- `/styles`: Global CSS and styling configurations.

## 📝 License

This project is licensed under the MIT License.
