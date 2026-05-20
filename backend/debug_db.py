from src.db.connection import engine
import sqlalchemy as sa

conn = engine.connect()
print('tables:', [row[0] for row in conn.execute(sa.text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"))])
for tbl in ['usuario', 'Usuario']:
    try:
        rs = conn.execute(sa.text(f'SELECT count(*) FROM "{tbl}"' if tbl == 'Usuario' else 'SELECT count(*) FROM usuario'))
        print(tbl, list(rs)[0][0])
    except Exception as e:
        print(tbl, 'ERROR', e)
conn.close()
