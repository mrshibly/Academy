import sqlite3

def check():
    conn = sqlite3.connect("c:/Users/mrshibly/Downloads/Academy/backend/academy.db")
    cursor = conn.cursor()
    cursor.execute("SELECT enrollment_id, lesson_id, status FROM lesson_progress;")
    print("Lesson progress states:", cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    check()
