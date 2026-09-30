import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.logging_config import setup_logging
from src.routes import employees
from src.routes import leaderboard
from src.routes import stats
from src.routes import activities
from src.routes import scores
from src.routes import access

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(leaderboard.router)
app.include_router(stats.router)
app.include_router(activities.router)
app.include_router(scores.router)
app.include_router(access.router)


@app.get("/")
def read_root():
    return {"message": "Leaderboard API is running"}


@app.on_event("startup")
def on_startup():
    logger.info("Leaderboard API starting up")