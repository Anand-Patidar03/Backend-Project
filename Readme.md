# ClipprX – Backend API for a Video Sharing Platform

ClipprX is a **backend-only REST API** for a video sharing platform, inspired by real-world applications like YouTube.  
This project focuses on **backend architecture, authentication, database design, and scalable API development**.

The frontend is intentionally not included, as the primary goal is to demonstrate **backend engineering skills**.

---

## Features

### Authentication & Authorization

- User registration & login
- JWT-based authentication (Access & Refresh tokens)
- Secure protected routes

### Video Management

- Upload videos using Cloudinary
- Fetch videos with pagination & sorting
- Delete/update videos (owner-only access)

### Likes & Comments

- Like / unlike videos
- Comment on videos
- Like / unlike comments

### Subscriptions & Channels

- Subscribe / unsubscribe to channels
- Get channel subscribers list
- Get channel statistics (videos, subscribers, likes)

### Architecture & Quality

- Clean MVC folder structure
- Centralized error handling
- Input validation
- Modular & reusable code

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT
- **Media Storage:** Cloudinary
- **Testing:** Postman
- **Environment:** dotenv

---

## Project Structure

```text
src/
│── controllers/     # Business logic for routes
│── models/          # Mongoose schemas
│── routes/          # API routes
│── middlewares/     # Auth & error handling middleware
│── utils/           # Helper functions
│── app.js           # Express app configuration
│── index.js         # Server entry point
```

## Installation & Setup

### 1: Clone the repository

```bash
git clone https://github.com/your-username/videogram-backend.git
cd videogram-backend
```

### 2: Install dependencies

```bash
npm install
```

### 3: Run the server

```bash
npm run dev
```

### 4: Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=7000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```