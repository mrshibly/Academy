import sqlite3

def check():
    conn = sqlite3.connect("c:/Users/mrshibly/Downloads/Academy/backend/academy.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, status, completed_at FROM enrollments;")
    print("Enrollments:", cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    check()
