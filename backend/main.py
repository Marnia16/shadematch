"""
ShadeMatch FastAPI Application.
Provides REST API endpoints for computer vision image analysis,
skin-tone estimation, and personalized fashion color recommendations.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Safely load local .env if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from routes.health import router as health_router
from routes.analysis import router as analysis_router
from routes.recommendations import router as recommendations_router
from routes.tryon import router as tryon_router

app = FastAPI(
    title="ShadeMatch API",
    description="Personalized fashion color recommendation and AI Virtual Try-On backend powered by OpenCV & Scikit-Learn.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# -----------------------------------------------------------------------------
# CORS Configuration
# -----------------------------------------------------------------------------
# Default allowed origins for local development
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

# Read configurable production frontend origin from FRONTEND_URL environment variable
frontend_url_env = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = list(default_origins)

if frontend_url_env:
    for url in frontend_url_env.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

# Attach CORS middleware with explicit origins and Vercel preview domain pattern
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Route Registration
# -----------------------------------------------------------------------------
app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(tryon_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Welcome to the ShadeMatch API",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": [
            "POST /api/analyze",
            "POST /api/analyze-json",
            "POST /api/recommend",
            "POST /api/try-on",
            "POST /api/try-on-json",
            "GET /api/health"
        ]
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during image processing. Please try again with another photo.",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
