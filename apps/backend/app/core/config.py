from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis Backend"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Gemini AI
    GEMINI_API_KEY: str
    AI_PROVIDER: str = "gemini"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001"
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()