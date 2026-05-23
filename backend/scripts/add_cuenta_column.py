from src.config.env import settings
from sqlalchemy import create_engine, text

if __name__ == '__main__':
    db_url = settings.get_database_url()
    print('Using DB URL:', db_url)
    engine = create_engine(db_url)
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE reproduccion ADD COLUMN IF NOT EXISTS cuenta_para_estadisticas BOOLEAN DEFAULT FALSE"))
    print('ALTER TABLE executed')
