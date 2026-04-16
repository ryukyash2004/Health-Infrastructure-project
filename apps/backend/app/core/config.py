from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis Backend"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
