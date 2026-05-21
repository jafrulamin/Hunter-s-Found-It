# Hunter's FoundIt – Lost and Found Web App

Hunter's FoundIt is a full-stack web application that helps students and staff
report, browse, and recover lost items on campus.

## Team

- Mashiyat Mahdi (Frontend)
- Jafrul Amin (Backend)

## Tech Stack

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary
- **Hosting:** Render.com

## Features

- Create lost or found item posts with optional image
- Browse all posts in a feed
- Search posts by keyword (title, description, location)
- Filter posts by status (lost, found)
- Edit or delete your own posts
- Mark posts as resolved
- Post anonymously
- User registration and login (JWT auth)
- Responsive design for mobile and desktop

## Project Structure

```
Hunter-s-Found-It/
├── frontend/   React app (Vite + Tailwind CSS)
└── backend/    Node.js + Express API
```

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (free tier)
- A Cloudinary account (free tier)

### 1. Backend Setup

```
cd backend
npm install
```

Create a `.env` file in `backend/` (you can copy `.env.example`) and fill in:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then start the server:

```
npm run dev
```

The API will be running at `http://localhost:5000`.

### 2. Frontend Setup

In a new terminal:

```
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`. The Vite dev server proxies any
request to `/api/...` to the backend on port 5000, so you don't need to set
an API URL during development.

## Deployment (Render.com)

### Backend (Web Service)

1. Push your repo to GitHub
2. On Render, create a new Web Service from your GitHub repo
3. Set root directory to `backend/`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables (MONGO_URI, JWT_SECRET, CLOUDINARY_*)

### Frontend (Static Site)

1. On Render, create a new Static Site
2. Set root directory to `frontend/`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL = https://<your-backend>.onrender.com`

## API Routes

- `POST   /api/auth/register` — Create a new account
- `POST   /api/auth/login` — Log in
- `GET    /api/auth/me` — Get the current user (auth)
- `GET    /api/posts` — List all posts
- `GET    /api/posts/:id` — Get one post
- `POST   /api/posts` — Create a post (auth)
- `PATCH  /api/posts/:id` — Update your own post (auth)
- `DELETE /api/posts/:id` — Delete your own post (auth)
- `GET    /api/posts/user/me` — Your posts (auth)
- `POST   /api/upload` — Upload an image to Cloudinary (auth)
