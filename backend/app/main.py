from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
import uvicorn

app = FastAPI(title="Synapse Frontier Neural Core", version="2.1.0")

# WebSocket connections don't need credentials (cookies) for this app, 
# and mixing allow_origins=["*"] with allow_credentials=True can cause 403s.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)

@app.get("/")
def health_check():
    return {"status": "Synapse Frontier Neural Core Online", "sector": "7G"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
