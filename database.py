import sqlite3
import os
from datetime import datetime

# Path to the SQLite database file
DB_NAME = "healthtrack.db"


# This function opens a connection to the SQLite database and returns it
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    # Enable SQLite foreign key constraints for relationship integrity
    conn.execute("PRAGMA foreign_keys = ON;")
    # This allows accessing columns by name like row['test_name']
    conn.row_factory = sqlite3.Row
    return conn


# This function creates the database tables for users and their isolated health data
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Create table for registered patient user accounts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # 2. Create table for user-specific medical PDF reports with AI summary column
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            ai_summary TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Automatically add ai_summary column if table was created in an earlier version
    cursor.execute("PRAGMA table_info(reports)")
    columns = [col["name"] for col in cursor.fetchall()]
    if "ai_summary" not in columns:
        cursor.execute("ALTER TABLE reports ADD COLUMN ai_summary TEXT")

    # 3. Create table for user-specific manual lab test entries
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            test_name TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            test_date TEXT NOT NULL,
            ref_min REAL NOT NULL,
            ref_max REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # 4. Create table for user-specific checkup reminders
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            checkup_date TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


# This function registers a new user and seeds starter demo tests just for their account
def create_user(name, email, password_hash):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO users (name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
    """, (name.strip(), email.strip().lower(), password_hash, created_at))
    new_user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Automatically seed starter demo tests so charts work on their first login
    seed_demo_tests_for_user(new_user_id)
    return new_user_id


# This function fetches a single user record by their unique email address
def get_user_by_email(email):
    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email.strip().lower(),)
    ).fetchone()
    conn.close()
    return user


# This function fetches a single user record by their primary user ID
def get_user_by_id(user_id):
    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()
    conn.close()
    return user


# This function seeds a few starter test records for a specific newly registered user
def seed_demo_tests_for_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    demo_tests = [
        (user_id, "Fasting Blood Sugar", 118.0, "mg/dL", "2025-01-10", 70.0, 99.0),
        (user_id, "Fasting Blood Sugar", 112.0, "mg/dL", "2025-02-15", 70.0, 99.0),
        (user_id, "Fasting Blood Sugar", 104.0, "mg/dL", "2025-03-20", 70.0, 99.0),
        (user_id, "Hemoglobin", 13.8, "g/dL", "2025-01-10", 12.0, 16.0),
        (user_id, "Total Cholesterol", 210.0, "mg/dL", "2025-01-10", 125.0, 200.0),
        (user_id, "Total Cholesterol", 195.0, "mg/dL", "2025-03-20", 125.0, 200.0)
    ]
    cursor.executemany("""
        INSERT INTO tests (user_id, test_name, value, unit, test_date, ref_min, ref_max)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, demo_tests)

    demo_reminders = [
        (user_id, "Annual Preventative Checkup", "2025-06-15", "Consult physician for yearly blood panel review")
    ]
    cursor.executemany("""
        INSERT INTO reminders (user_id, title, checkup_date, notes)
        VALUES (?, ?, ?, ?)
    """, demo_reminders)

    conn.commit()
    conn.close()


# This function gets all uploaded medical reports that belong ONLY to the logged-in user
def get_all_reports(user_id):
    conn = get_db_connection()
    reports = conn.execute(
        "SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return reports


# This function fetches a specific report ensuring it belongs to the logged-in user
def get_report_by_id(report_id, user_id):
    conn = get_db_connection()
    report = conn.execute(
        "SELECT * FROM reports WHERE id = ? AND user_id = ?",
        (report_id, user_id)
    ).fetchone()
    conn.close()
    return report


# This function inserts a newly uploaded report record for the logged-in user
def add_report(user_id, title, file_path, upload_date):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO reports (user_id, title, file_path, upload_date, ai_summary) VALUES (?, ?, ?, ?, NULL)",
        (user_id, title, file_path, upload_date)
    )
    conn.commit()
    conn.close()


# This function saves the AI analysis summary for a specific report in the database
def update_report_ai_summary(report_id, user_id, ai_summary):
    conn = get_db_connection()
    conn.execute(
        "UPDATE reports SET ai_summary = ? WHERE id = ? AND user_id = ?",
        (ai_summary, report_id, user_id)
    )
    conn.commit()
    conn.close()


# This function deletes a report only if it belongs to the logged-in user
def delete_report(report_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM reports WHERE id = ? AND user_id = ?",
        (report_id, user_id)
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# This function retrieves all test records for the logged-in user ordered by date
def get_all_tests(user_id):
    conn = get_db_connection()
    tests = conn.execute(
        "SELECT * FROM tests WHERE user_id = ? ORDER BY test_date DESC, id DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return tests


# This function retrieves the most recent test entries for the logged-in user's dashboard
def get_recent_tests(user_id, limit=5):
    conn = get_db_connection()
    tests = conn.execute(
        "SELECT * FROM tests WHERE user_id = ? ORDER BY test_date DESC, id DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return tests


# This function adds a new manual lab test entry for the logged-in user
def add_test(user_id, test_name, value, unit, test_date, ref_min, ref_max):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO tests (user_id, test_name, value, unit, test_date, ref_min, ref_max) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user_id, test_name.strip(), float(value), unit.strip(), test_date, float(ref_min), float(ref_max))
    )
    conn.commit()
    conn.close()


# This function deletes a test entry only if it belongs to the logged-in user
def delete_test(test_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM tests WHERE id = ? AND user_id = ?",
        (test_id, user_id)
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# This function retrieves distinct test names recorded by the logged-in user
def get_distinct_test_names(user_id):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT DISTINCT test_name FROM tests WHERE user_id = ? ORDER BY test_name ASC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [row["test_name"] for row in rows]


# This function retrieves all test history records for a specific test for the logged-in user
def get_tests_by_name(user_id, test_name):
    conn = get_db_connection()
    tests = conn.execute(
        "SELECT * FROM tests WHERE user_id = ? AND test_name = ? ORDER BY test_date ASC, id ASC",
        (user_id, test_name)
    ).fetchall()
    conn.close()
    return tests


# This function retrieves all checkup reminders belonging to the logged-in user
def get_all_reminders(user_id):
    conn = get_db_connection()
    reminders = conn.execute(
        "SELECT * FROM reminders WHERE user_id = ? ORDER BY checkup_date ASC",
        (user_id,)
    ).fetchall()
    conn.close()
    return reminders


# This function adds a new upcoming checkup reminder for the logged-in user
def add_reminder(user_id, title, checkup_date, notes):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO reminders (user_id, title, checkup_date, notes) VALUES (?, ?, ?, ?)",
        (user_id, title.strip(), checkup_date, notes.strip() if notes else "")
    )
    conn.commit()
    conn.close()


# This function deletes a reminder only if it belongs to the logged-in user
def delete_reminder(reminder_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM reminders WHERE id = ? AND user_id = ?",
        (reminder_id, user_id)
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
