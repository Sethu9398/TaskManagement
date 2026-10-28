from fastapi import FastAPI
from .database import engine, Base
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from .router.userRouter import router as user_router

Base.metadata.create_all(bind=engine)
app = FastAPI()
# Allow requests from your frontend
origins = [
    "http://localhost:3000",  # React
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    print("Database connected successfully!")

except Exception as e:
    print("Database connection failed!")
    print("Error details:", repr(e))


@app.get("/")
def home():
    return {"message": "this is home page"}


app.include_router(user_router)
