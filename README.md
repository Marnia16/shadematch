# ShadeMatch — Haute Fashion Colorimetry Studio

**ShadeMatch** is a personalized fashion color recommendation web application built with a modern **React** frontend and supported by a **FastAPI**, **OpenCV**, and **scikit-learn** backend.

The application analyzes a person's photo (via file upload or live camera viewfinder), estimates their skin-tone category and undertone using dermatological colorimetry (Individual Typology Angle - ITA and CIELAB space), and recommends complementary dress colors and curated 4-piece outfit combinations tailored to their selected silhouette and occasion.

---

## Deployment Architecture

```
User
  ↓
Vercel-hosted React Application (https://YOUR-APP.vercel.app)
  ↓ (VITE_API_URL)
Public FastAPI Service on Render (https://YOUR-API.onrender.com)
  ↓ (FRONTEND_URL CORS)
OpenCV + ML Processing
  ↓
Structured JSON Response
  ↓
React UI / Lookbook / Outfit Builder
```

---

## Architecture & Technology Stack

### Frontend — Primary (React)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom editorial luxury design system
- **Routing**: React Router DOM (with `vercel.json` SPA rewrite rules)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Celebratory Effects**: Canvas Confetti
- **Services**: Dedicated API client (`src/services/api.js`) and Firebase Auth / Firestore service (`src/services/firebase.js`) with built-in persistent LocalStorage fallback

### Backend — Supporting (FastAPI + CV/ML)
- **API Framework**: FastAPI & Uvicorn (configured for dynamic `$PORT` and CORS)
- **Computer Vision**: OpenCV Headless (`opencv-python-headless` for cloud Linux compatibility)
- **Scientific Colorimetry**: CIELAB $L^*, a^*, b^*$, Individual Typology Angle (ITA), and undertone chromatic ratio
- **Machine Learning**: Extensible `SkinTonePredictor` interface with 7-dimensional feature vectors ($L^*, a^*, b^*, \text{ITA}, H, S, V$), ready for drop-in trained scikit-learn models (`RandomForestClassifier`, `SVC`, etc.)
- **Recommendation Engine**: Multi-dimensional rule matrix mapping `(tone, undertone, dress_type, occasion)` to power colors, neutrals, statement accents, and 4-piece outfit coordinates

---

## Project Structure

```
shadematch/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                 # Vercel SPA rewrite configuration
│   ├── package.json
│   ├── .env.example                # Example frontend environment variables
│   ├── .gitignore                  # Frontend git exclusion rules
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx          # Header with live AI Engine status badge
│       │   ├── Footer.jsx          # Fashion-tech footer & ethical disclaimer
│       │   ├── ImageUploader.jsx   # Drag & drop upload with instant lighting check
│       │   ├── CameraCapture.jsx   # Live webcam capture with facial oval HUD
│       │   ├── LightingAlert.jsx   # Real-time ambient lighting advisory
│       │   ├── DressSelector.jsx   # 8 Silhouette cards (Saree, Gown, Shirt, etc.)
│       │   ├── OccasionSelector.jsx# 7 Occasion cards (Wedding, Office, Party, etc.)
│       │   ├── LoadingAnalysis.jsx # 4-stage biometric scanning HUD
│       │   ├── ColorCard.jsx       # Large swatch, HEX copy, contrast, favorites
│       │   ├── ColorPalette.jsx    # Categorized palettes (Power, Neutrals, Accents)
│       │   ├── OutfitBuilder.jsx   # 4-piece interactive look builder (Dress, Acc, Shoes, Bag)
│       │   ├── RecommendationCard.jsx # Estimated complexion & tailored styling advice
│       │   └── AuthModal.jsx       # Firebase Auth / Guest Demo modal
│       ├── pages/
│       │   ├── Home.jsx            # Editorial landing page with hero & how-it-works
│       │   ├── Analyze.jsx         # Studio analysis wizard
│       │   ├── Results.jsx         # Personalized palette showcase & outfit builder
│       │   ├── Favorites.jsx       # "My Looks" saved ensemble library
│       │   ├── Explore.jsx         # Seasonal color theory & undertone guide
│       │   └── Profile.jsx         # User preferences, saved count, and settings
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── AnalysisContext.jsx
│       ├── services/
│       │   ├── api.js              # FastAPI REST client (uses VITE_API_URL)
│       │   └── firebase.js         # Firebase Auth & Firestore with LocalStorage sync
│       ├── data/
│       │   ├── dressTypes.js
│       │   ├── occasions.js
│       │   └── colorTheory.js
│       └── utils/
│           ├── colorHelpers.js     # WCAG contrast calculator & clipboard utility
│           └── imageHelpers.js     # Client-side image validation & lighting check
│
├── backend/
│   ├── main.py                     # FastAPI entrypoint, dynamic CORS & $PORT handling
│   ├── requirements.txt            # Headless Python dependencies (opencv-python-headless)
│   ├── test_backend.py             # Internal verification test suite
│   ├── .env.example                # Example backend environment variables
│   ├── .gitignore                  # Backend git exclusion rules
│   ├── routes/
│   │   ├── health.py               # GET /api/health
│   │   ├── analysis.py             # POST /api/analyze & POST /api/analyze-json
│   │   └── recommendations.py      # POST /api/recommend
│   ├── services/
│   │   ├── image_processor.py      # OpenCV face detection & skin ROI isolation
│   │   ├── skin_tone_analyzer.py   # ITA angle & CIELAB metrics
│   │   └── recommendation_engine.py# Contextual fashion recommendation engine
│   ├── models/
│   │   └── predictor.py            # ML predictor interface (checks SKIN_TONE_MODEL_PATH)
│   └── utils/
│       └── image_utils.py          # Image decoding & quality evaluation
│
├── render.yaml                     # Render Blueprint specification for Web Service
├── .gitignore                      # Root git exclusion rules
└── README.md
```

---

## Local Development

### 1. Start the Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```

The backend is now live at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

Verify the backend anytime with:
```bash
python3 test_backend.py
```

### 2. Start the Frontend (React + Vite)

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser. In local development mode (`npm run dev`), the frontend automatically connects to `http://localhost:8000` unless overridden by `VITE_API_URL`.

---

## Public Deployment Guide

### Phase 1: Deploy Backend to Render

1. **Push your repository to GitHub**:
   Ensure all files are committed and pushed to your remote repository.

2. **Create a New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
   - Connect your GitHub repository.

3. **Configure the Service Settings**:
   - **Name**: `shadematch-backend` (or your preferred name)
   - **Region**: Choose the closest region to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`

4. **Add Environment Variables**:
   In the **Environment Variables** section on Render, add:
   - `PYTHON_VERSION`: `3.11.9`
   - `FRONTEND_URL`: Leave blank or set to `http://localhost:5173` initially. You will update this with your actual Vercel URL in Phase 3.

5. **Deploy**:
   - Click **Create Web Service**.
   - Wait for the build and deployment to finish.
   - Test your deployment by visiting: `https://YOUR-BACKEND.onrender.com/api/health` (should return `{"status":"healthy", ...}`).
   - **Copy your Render URL**: e.g., `https://shadematch-backend.onrender.com`

---

### Phase 2: Deploy Frontend to Vercel

1. **Import Project into Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
   - Select your GitHub repository.

2. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)

3. **Set Production Environment Variables**:
   In the **Environment Variables** accordion, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND.onrender.com` *(use your actual Render URL from Phase 1, without a trailing slash)*

   *(Optional)* If you wish to connect a live Google Firebase project, also add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, build the production bundle, and deploy the application.
   - **Copy your Vercel URL**: e.g., `https://shadematch.vercel.app`

---

### Phase 3: Connect Frontend and Backend (Close the Loop)

1. **Update Render CORS with your Vercel URL**:
   - Go back to your Render dashboard for `shadematch-backend`.
   - Go to **Environment** tab.
   - Set or update:
     - `FRONTEND_URL`: `https://YOUR-APP.vercel.app`
   - Click **Save Changes** (Render will automatically redeploy with the updated CORS origin).

2. **Verify End-to-End**:
   - Open your deployed Vercel URL in your browser (`https://YOUR-APP.vercel.app`).
   - The top navigation bar badge will display a green pulsing **"AI Engine Live"** indicator, confirming successful communication with Render.
   - Perform a color analysis using photo upload or camera capture to verify full computer vision, recommendation, and look builder flow.

---

## API Endpoints Reference

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/health` | Health check and capabilities | None |
| `POST` | `/api/analyze` | Full image analysis + recommendations | `multipart/form-data` (`image`, `dress_type`, `occasion`) |
| `POST` | `/api/analyze-json` | Base64 canvas capture analysis | `application/json` (`image_base64`, `dress_type`, `occasion`) |
| `POST` | `/api/recommend` | Dynamic recommendation re-query | `application/json` (`skin_tone`, `undertone`, `dress_type`, `occasion`) |

---

## How to Plug in a Trained ML Model

The machine learning interface is cleanly decoupled in `backend/models/predictor.py`.

To replace the baseline colorimetric engine with a trained scikit-learn model:
1. Train your model using the 7-dimensional feature array:
   $[L^*, a^*, b^*, \text{ITA}, \text{Hue}, \text{Saturation}, \text{Value}]$.
2. Save your trained model with joblib:
   ```python
   import joblib
   joblib.dump(your_trained_model, "backend/models/skin_tone_rf.joblib")
   ```
3. Set the environment variable on Render:
   - `SKIN_TONE_MODEL_PATH`: `models/skin_tone_rf.joblib`
   The `SkinTonePredictor` will automatically load the serialized model and compute class probabilities. The rest of the pipeline remains completely untouched.

---

## Deployment Checklist

- [x] **Frontend builds successfully**: `npm run build` completes with 0 errors and generates optimized production bundle in `dist/`.
- [x] **Backend starts successfully**: Production entry point `uvicorn main:app --host 0.0.0.0 --port $PORT` is tested and verified.
- [x] **CORS configured**: Secure explicit origins via `FRONTEND_URL`, supporting Vercel preview domains (`allow_origin_regex=r"https://.*\.vercel\.app"`) with zero wildcards.
- [x] **Environment variables configured**: `VITE_API_URL` for frontend; `FRONTEND_URL`, `PORT`, `HOST`, and optional `SKIN_TONE_MODEL_PATH` for backend.
- [x] **API endpoint works**: `/api/health`, `/api/analyze`, and `/api/recommend` pass all integration tests.
- [x] **Image upload works**: Handles both multipart/form-data file uploads and direct webcam base64 canvas frames.
- [x] **ML/OpenCV processing works**: `opencv-python-headless` ensures headless Linux cloud compatibility without requiring X11/libGL dependencies.
- [x] **React receives API response**: Data contract matches exact frontend context expectations and provides graceful fallback if server is offline.
- [x] **Firebase authentication works**: Full email/password and guest modes supported; fallback storage enables zero-config deployment.
- [x] **Favorites work**: "My Looks" ensemble builder and color bookmarks persist across sessions.
- [x] **React Router works after deployment**: `frontend/vercel.json` provides SPA rewrites so direct navigation to `/analyze`, `/results`, `/favorites`, `/profile`, and `/explore` never 404s.
- [x] **No localhost URLs remain in production code**: All API requests resolve through `import.meta.env.VITE_API_URL` with automatic trailing-slash trimming.
- [x] **No private credentials are committed**: Comprehensive `.gitignore` protects `.env*`, keys, virtual environments, and bytecode.
