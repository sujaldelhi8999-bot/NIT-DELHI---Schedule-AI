"""
init_db.py — Create timetable_db database, tables, sample data, and user accounts.
"""
import mysql.connector
from werkzeug.security import generate_password_hash
import json, sys

DB_HOST = "localhost"
DB_USER = "root"
DB_PASS = "12345"
DB_NAME = "timetable_db"

def get_root_conn():
    return mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS)

def get_db_conn():
    return mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)

SCHEMA_SQL = """
CREATE DATABASE IF NOT EXISTS {db} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE {db};

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','teacher','student') NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    theory_hours INT DEFAULT 0,
    lab_hours INT DEFAULT 0,
    theory_periods INT DEFAULT 1,
    lab_periods INT DEFAULT 2,
    lab_type_id VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (lab_type_id) REFERENCES lab_types(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    semester VARCHAR(50) DEFAULT '',
    student_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 60,
    is_lab BOOLEAN DEFAULT FALSE,
    lab_type_id VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (lab_type_id) REFERENCES lab_types(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS combined_classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS combined_sections (
    combined_id VARCHAR(50),
    section_id VARCHAR(50),
    PRIMARY KEY (combined_id, section_id),
    FOREIGN KEY (combined_id) REFERENCES combined_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculty_mappings (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    is_combined BOOLEAN DEFAULT FALSE,
    combined_id VARCHAR(50) DEFAULT '',
    is_ta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculty_sections (
    faculty_id VARCHAR(50),
    section_id VARCHAR(50),
    PRIMARY KEY (faculty_id, section_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty_mappings(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS timetable_entries (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) DEFAULT '',
    entry_type VARCHAR(20) NOT NULL,
    faculty_id VARCHAR(50) NOT NULL,
    faculty_name VARCHAR(200) DEFAULT '',
    day VARCHAR(20) NOT NULL,
    slot_idx INT NOT NULL,
    required_slots INT DEFAULT 1,
    room_id VARCHAR(50) DEFAULT '',
    room_name VARCHAR(100) DEFAULT '',
    is_combined BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS entry_sections (
    entry_id VARCHAR(50),
    section_id VARCHAR(50),
    PRIMARY KEY (entry_id, section_id),
    FOREIGN KEY (entry_id) REFERENCES timetable_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS locked_slots (
    id VARCHAR(50) PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    slot_idx INT NOT NULL,
    faculty_id VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_name VARCHAR(200) DEFAULT '',
    sender_role VARCHAR(20) NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_section_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_sections (
    user_id INT,
    section_id VARCHAR(50),
    PRIMARY KEY (user_id, section_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
""".format(db=DB_NAME)

def create_schema():
    conn = get_root_conn()
    cursor = conn.cursor()
    for stmt in SCHEMA_SQL.split(";"):
        stmt = stmt.strip()
        if stmt:
            cursor.execute(stmt)
    conn.commit()
    cursor.close()
    conn.close()

def seed_data():
    conn = get_db_conn()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] > 0:
        c.close()
        conn.close()
        return

    # 1. Lab Types
    lab_types = [
        ("lt_comp", "Computer Lab"),
        ("lt_phy",  "Physics Lab"),
        ("lt_elec", "Electronics Lab"),
    ]
    c.executemany("INSERT INTO lab_types (id, name) VALUES (%s, %s)", lab_types)

    # 2. Courses (Mapped directly to lab types)
    courses = [
        ("c_lao", "Linear Algebra & Optimization", "LAO", 4, 0, 1, 2, None),
        ("c_dld", "Digital Logic Design",          "DLD", 3, 2, 1, 2, "lt_elec"),
        ("c_ds",  "Data Structures",               "DS",  3, 2, 1, 2, "lt_comp"),
        ("c_pp",  "Python Programming",            "PP",  3, 2, 1, 2, "lt_comp"),
        ("c_phy", "Physics",                       "PHY", 2, 2, 1, 2, "lt_phy"),
        ("c_eng", "English (Soft Skills)",         "ENG", 3, 0, 1, 2, None),
        ("c_fwd", "Fundamentals of Web Design",    "FWD", 2, 2, 1, 2, "lt_comp"),
    ]
    c.executemany("INSERT INTO courses (id,name,code,theory_hours,lab_hours,theory_periods,lab_periods,lab_type_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)", courses)

    # 3. Sections
    sections = [
        ("s_a", "Section A", "Sem 2", 50),
        ("s_b", "Section B", "Sem 2", 50),
        ("s_c", "Section C", "Sem 2", 50),
        ("s_d", "Section D", "Sem 2", 50),
        ("s_e", "Section E", "Sem 2", 50),
        ("s_f", "Section F", "Sem 2", 50),
    ]
    c.executemany("INSERT INTO sections (id,name,semester,student_count) VALUES (%s,%s,%s,%s)", sections)

    # 4. Rooms (Mapped to lab types)
    rooms = [
        ("r_001", "CSE1", 60, False, None),
        ("r_002", "CSE2", 60, False, None),
        ("r_003", "CSE3", 60, False, None),
        ("r_004", "CSE4", 60, False, None),
        ("r_005", "CSE5", 60, False, None),
        ("r_006", "CSE6", 60, False, None),
        ("r_007", "CSE7", 60, False, None),
        ("r_008", "CSE8", 60, False, None),
        ("r_009", "CSE9", 60, False, None),
        ("r_010", "Computer Lab 1", 60, True, "lt_comp"),
        ("r_011", "Computer Lab 2", 60, True, "lt_comp"),
        ("r_012", "Computer Lab 3", 60, True, "lt_comp"),
        ("r_013", "Physics Lab",    60, True, "lt_phy"),
        ("r_014", "Electronics Lab", 60, True, "lt_elec"),
    ]
    c.executemany("INSERT INTO rooms (id,name,capacity,is_lab,lab_type_id) VALUES (%s,%s,%s,%s,%s)", rooms)

    # 5. Settings
    settings = {
        "daysOfWeek":     '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
        "startTime":      '"09:30"',
        "endTime":        '"18:30"',
        "periodDuration": "60",
        "lunchStart":     '"13:30"',
        "lunchEnd":       '"14:30"',
        "teacherMaxHoursD": "6",
        "teacherMaxHoursW": "25",
        "maxLabsPerDay": "2"
    }
    for k, v in settings.items():
        c.execute("INSERT INTO settings (setting_key, setting_value) VALUES (%s,%s)", (k, v))

    # 6. Users & Faculty
    admin_hash = generate_password_hash("admin123")
    c.execute("INSERT INTO users (username, password_hash, role, name) VALUES (%s,%s,%s,%s)", ("admin", admin_hash, "admin", "Administrator"))

    teacher_data = [
        ("f_lao1", "Teacher 1",  "teacher1"), ("f_lao2", "Teacher 2",  "teacher2"), ("f_lao3", "Teacher 3",  "teacher3"),
        ("f_dld1", "Teacher 4",  "teacher4"), ("f_dld2", "Teacher 5",  "teacher5"), ("f_ds1",  "Teacher 6",  "teacher6"),
        ("f_ds2",  "Teacher 7",  "teacher7"), ("f_ds3",  "Teacher 8",  "teacher8"), ("f_pp1",  "Teacher 9",  "teacher9"),
        ("f_pp2",  "Teacher 10", "teacher10"),("f_pp3",  "Teacher 11", "teacher11"),("f_phy1", "Teacher 12", "teacher12"),
        ("f_phy2", "Teacher 13", "teacher13"),("f_eng1", "Teacher 14", "teacher14"),("f_eng2", "Teacher 15", "teacher15"),
        ("f_eng3", "Teacher 16", "teacher16"),("f_fwd1", "Teacher 17", "teacher17"),("f_fwd2", "Teacher 18", "teacher18"),
        ("f_fwd3", "Teacher 19", "teacher19"),
    ]
    teacher_pwd = generate_password_hash("teacher123")
    teacher_user_ids = {}
    for fac_id, name, username in teacher_data:
        c.execute("INSERT INTO users (username, password_hash, role, name) VALUES (%s,%s,%s,%s)", (username, teacher_pwd, "teacher", name))
        teacher_user_ids[fac_id] = c.lastrowid

    student_pwd = generate_password_hash("student123")
    for sec_id, sec_name, _, _ in sections:
        letter = sec_name.split()[-1].lower()
        username = f"student_{letter}"
        c.execute("INSERT INTO users (username, password_hash, role, name) VALUES (%s,%s,%s,%s)", (username, student_pwd, "student", f"Student {letter.upper()}"))
        uid = c.lastrowid
        c.execute("INSERT INTO student_sections (user_id, section_id) VALUES (%s,%s)", (uid, sec_id))

    faculty = [
        ("f_lao1", "Teacher 1",  "c_lao", False, "", ["s_a","s_b"]),
        ("f_lao2", "Teacher 2",  "c_lao", False, "", ["s_c","s_d"]),
        ("f_lao3", "Teacher 3",  "c_lao", False, "", ["s_e","s_f"]),
        ("f_dld1", "Teacher 4",  "c_dld", False, "", ["s_a","s_b","s_c"]),
        ("f_dld2", "Teacher 5",  "c_dld", False, "", ["s_d","s_e","s_f"]),
        ("f_ds1",  "Teacher 6",  "c_ds",  False, "", ["s_a","s_b"]),
        ("f_ds2",  "Teacher 7",  "c_ds",  False, "", ["s_c","s_d"]),
        ("f_ds3",  "Teacher 8",  "c_ds",  False, "", ["s_e","s_f"]),
        ("f_pp1",  "Teacher 9",  "c_pp",  False, "", ["s_a","s_b"]),
        ("f_pp2",  "Teacher 10", "c_pp",  False, "", ["s_c","s_d"]),
        ("f_pp3",  "Teacher 11", "c_pp",  False, "", ["s_e","s_f"]),
        ("f_phy1", "Teacher 12", "c_phy", False, "", ["s_a","s_b","s_c"]),
        ("f_phy2", "Teacher 13", "c_phy", False, "", ["s_d","s_e","s_f"]),
        ("f_eng1", "Teacher 14", "c_eng", False, "", ["s_a","s_b"]),
        ("f_eng2", "Teacher 15", "c_eng", False, "", ["s_c","s_d"]),
        ("f_eng3", "Teacher 16", "c_eng", False, "", ["s_e","s_f"]),
        ("f_fwd1", "Teacher 17", "c_fwd", False, "", ["s_a","s_b"]),
        ("f_fwd2", "Teacher 18", "c_fwd", False, "", ["s_c","s_d"]),
        ("f_fwd3", "Teacher 19", "c_fwd", False, "", ["s_e","s_f"]),
    ]
    for fac_id, name, course_id, is_combined, combined_id, sec_ids in faculty:
        user_id = teacher_user_ids.get(fac_id)
        c.execute("INSERT INTO faculty_mappings (id, user_id, name, course_id, is_combined, combined_id) VALUES (%s,%s,%s,%s,%s,%s)",
            (fac_id, user_id, name, course_id, is_combined, combined_id))
        for sid in sec_ids:
            c.execute("INSERT INTO faculty_sections (faculty_id, section_id) VALUES (%s,%s)", (fac_id, sid))

    conn.commit()
    c.close()
    conn.close()

if __name__ == "__main__":
    create_schema()
    seed_data()
    print("Database Initialized successfully.")