from pydantic_settings import BaseSettings
from urllib.parse import quote_plus, urlparse, urlunparse


class Settings(BaseSettings):
    DATABASE_URL: str
    PORT: int = 8000
    JWT_SECRET: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_database_url(self) -> str:
        parsed = urlparse(self.DATABASE_URL)
        if parsed.password is None:
            return self.DATABASE_URL

        username = parsed.username or ""
        password = quote_plus(parsed.password, safe="")
        hostname = parsed.hostname or ""
        port = f":{parsed.port}" if parsed.port else ""
        netloc = f"{username}:{password}@{hostname}{port}"

        return urlunparse(
            (
                parsed.scheme,
                netloc,
                parsed.path,
                parsed.params,
                parsed.query,
                parsed.fragment,
            )
        )


settings = Settings()
