import os
import json
import psycopg2
from urllib.parse import urlparse

def main():
    url = os.getenv('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/LLA'
    parsed = urlparse(url)
    conn = psycopg2.connect(dbname=parsed.path[1:], user=parsed.username, password=parsed.password, host=parsed.hostname, port=parsed.port)
    cur = conn.cursor()
    cur.execute("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);")
    conn.commit()
    cur.execute("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='usuario' ORDER BY ordinal_position;")
    rows = cur.fetchall()
    print(json.dumps(rows, indent=2))
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
