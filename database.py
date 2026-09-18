from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql://admin:admin123@localhost:5432/leaderboard_db"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session