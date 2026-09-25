from typing import Annotated
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict, NoDecode
from sqlalchemy.engine import URL

class Settings(BaseSettings):
    database_host: str
    database_port: int
    database_name: str
    database_user: str
    database_password: str

    clerk_secret_key: str
    clerk_jwt_key: str | None = None
    clerk_authorized_parties: Annotated[list[str], NoDecode] = []

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator("clerk_authorized_parties", mode="before")
    @classmethod
    def _split_csv(cls, v):
        if isinstance(v, str):
            return [p.strip() for p in v.split(",") if p.strip()]
        return v

    @property
    def database_url(self) -> URL:
        return URL.create(
            "postgresql",
            username=self.database_user,
            password=self.database_password,
            host=self.database_host,
            port=self.database_port,
            database=self.database_name,
        )


settings = Settings()