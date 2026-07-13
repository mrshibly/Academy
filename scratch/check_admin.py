import sqlite3

def check():
    conn = sqlite3.connect("c:/Users/mrshibly/Downloads/Academy/backend/academy.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, is_verified, is_active FROM users WHERE email='admin@academy.dev';")
    print(cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    check()
