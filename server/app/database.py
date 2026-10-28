
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL

driver_name = "ODBC Driver 18 for SQL Server"

connection_url = URL.create(
    "mssql+pyodbc",
    host="localhost",
    database="task_management",
    query={
        "driver": driver_name,
        "trusted_connection": "yes",
        "TrustServerCertificate": "yes",
    },
)

engine = create_engine(
    connection_url,
    pool_pre_ping=True,
)

Base = declarative_base()


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()