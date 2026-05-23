from src.config.env import settings
from sqlalchemy import create_engine, text

if __name__ == '__main__':
    db_url = settings.get_database_url()
    print('Using DB URL:', db_url)
    engine = create_engine(db_url)
    with engine.begin() as conn:
        # Update existing reproducciones to mark those >=30% duration
        conn.execute(text(
            """
            UPDATE reproduccion r
            SET cuenta_para_estadisticas = (r.segundos_escuchados >= (0.3 * c.duracion_seg))
            FROM cancion c
            WHERE r.cancion_id = c.id
            """
        ))
    print('Reproducciones updated')
