import sqlite3

def migrate():
    conn = sqlite3.connect("c:/Users/mrshibly/Downloads/Academy/backend/academy.db")
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN signature_url VARCHAR(2048);")
        conn.commit()
        print("[SUCCESS] Added signature_url column to users table.")
    except sqlite3.OperationalError as e:
        print("[INFO] Column signature_url already exists or table doesn't exist:", e)
    conn.close()

if __name__ == "__main__":
    migrate()
