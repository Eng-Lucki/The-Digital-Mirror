from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, suggest

app = FastAPI(title="Virtual Wardrobe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_origin_regex=r"https://the-digital-mirror(-[a-z0-9]+)*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(suggest.router)

@app.get("/health")
def health():
    return {"status": "ok"}
