# 🪙 Rollercoin Market & Tracker

A professional, high-performance tracking and market management application for Rollercoin. This project features a robust **FastAPI (Python)** backend, a modern and reactive **Vue 3 + Vite + Tailwind CSS v4** frontend, and a dedicated **Maintenance Mode** page.

---

## 🚀 Features

- **User Profile Analytics:** Fetches and tracks real-time Rollercoin user profiles, room configurations, and power stats.
- **Market Data Manager:** Uploads and serves list information about miners, levels, and prices.
- **FastAPI Core:** Clean, reliable asynchronous API wrapper for Rollercoin endpoints.
- **Modern UI/UX:** Styled using the latest Tailwind CSS v4, Outfit fonts, custom scrollbars, and vibrant aesthetics.
- **One-Click Startup:** A unified startup script (`start.bat`) to run all microservices simultaneously.

---

## 📁 Repository Structure

```directory
Rollercoinmarkt/
├── backend/                  # FastAPI Python Backend
│   ├── data/                 # Local data storage (e.g., market_data.json)
│   ├── app.py                # Main FastAPI Application
│   ├── requirements.txt      # Python dependencies list
│   └── .env.example          # Environment variables template
├── frontend/                 # Vue 3 Frontend (Vite & Tailwind CSS v4)
│   ├── src/                  # Vue components, styles, assets
│   ├── index.html            # Main HTML entry point
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.js        # Vite build configuration
├── maintenance/              # Vue 3 Maintenance Page (Vite)
│   ├── src/                  # Vue sources for maintenance page
│   ├── index.html            # Maintenance HTML entry point
│   ├── package.json          # Dependencies & scripts for maintenance
│   └── vite.config.js        # Vite configuration for maintenance
├── start.bat                 # Windows controller/startup batch file
├── render.yaml               # Render Blueprint configuration for deployment
└── .gitignore                # Root-level Git ignores
```

---

## ☁️ Deployment (Render Blueprint)

This project contains a `render.yaml` blueprint. To deploy the backend to **Render** automatically:
1. Push this project to GitHub.
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure the Python FastAPI service with the correct build and start commands.
5. In the dashboard, enter your `BEARER_TOKEN` when prompted.

---

## 🛠️ Installation & Setup

### Prerequisites

- **Python** (version 3.8 or higher)
- **Node.js** (LTS version)
- **npm** (comes with Node.js)

---

### 1. Backend Setup

Navigate to the `backend` directory and configure the environment:

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open `.env` and fill in your Rollercoin `BEARER_TOKEN`:
   ```env
   BEARER_TOKEN="your_actual_rollercoin_bearer_token"
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload
   ```
   The backend API will be available at `http://127.0.0.1:8001`.

---

### 2. Frontend Setup

Navigate to the `frontend` directory:

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

### 3. Maintenance Page Setup (Optional)

Navigate to the `maintenance` directory:

1. Install dependencies:
   ```bash
   cd maintenance
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚡ Quick Start (Windows)

For ease of development on Windows, double-click the **`start.bat`** file in the root directory. This script will automatically spin up:
- The FastAPI Backend on port `8001`
- The Frontend Vue development server with host options enabled

---

## 📝 License

This project is open-source. Feel free to clone, modify, and distribute it as needed.
