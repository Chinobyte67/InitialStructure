import uvicorn

from src.config.env import settings

LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(levelname)s %(message)s"
        },
        "access": {
            "format": "%(levelname)s %(client_addr)s - \"%(request_line)s\" %(status_code)s"
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"level": "INFO"},
        "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
    },
}

if __name__ == "__main__":
    uvicorn.run("src.app:app", host="0.0.0.0", port=settings.PORT, reload=True, log_config=LOG_CONFIG)

#
