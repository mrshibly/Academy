import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def check():
    conn = sqlite3.connect("c:/Users/mrshibly/Downloads/Academy/backend/academy.db")
    cursor = conn.cursor()
    cursor.execute("SELECT email, hashed_password FROM users;")
    for email, h in cursor.fetchall():
        if not h: continue
        print("Email:", email)
        for p in ["admin123456", "admin123", "password123456", "password", "testpassword", "test"]:
            if pwd_context.verify(p, h):
                print(f"  FOUND PASSWORD: {p}")
                break
    conn.close()

if __name__ == "__main__":
    check()
