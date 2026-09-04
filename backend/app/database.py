from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def migrate_legacy_schema():
    """Small compatibility migration for the pre-Google-Forms schema.

    This keeps an existing local SQLite database usable while the project is being
    developed. Production deployments should eventually use Alembic migrations.
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if "questions" in tables:
        existing = {c["name"] for c in inspector.get_columns("questions")}
        additions = {
            "question_type": "VARCHAR DEFAULT 'multiple_choice'",
            "mode": "VARCHAR DEFAULT 'quiz'",
            "settings": "JSON",
            "section_title": "VARCHAR",
            "section_description": "TEXT",
        }
        with engine.begin() as conn:
            for name, definition in additions.items():
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE questions ADD COLUMN {name} {definition}"))
            # Backfill values needed by the new response models.
            conn.execute(text("UPDATE questions SET question_type = 'multiple_choice' WHERE question_type IS NULL"))
            conn.execute(text("UPDATE questions SET mode = 'quiz' WHERE mode IS NULL"))
            conn.execute(text("UPDATE questions SET settings = '{}' WHERE settings IS NULL"))
    if "responses" in tables:
        existing = {c["name"] for c in inspector.get_columns("responses")}
        if "answer_data" not in existing:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE responses ADD COLUMN answer_data JSON"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
