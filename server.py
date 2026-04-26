"""
server.py — Flask API server for the Intelligent Timetable Generator.
Serves static files + REST API with JWT auth and role-based access.
Run:  python server.py
"""
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import jwt
import datetime
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# ═══════════════════════════════════════════════
# Load .env file if present (no extra packages needed)
# ═══════════════════════════════════════════════
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_env_path = os.path.join(BASE_DIR, ".env")
if os.path.exists(_env_path):
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ[_k.strip()] = _v.strip().strip('"').strip("'")
    print(f"[AI] .env loaded from {_env_path}")
    print(f"[AI] OPENROUTER_API_KEY present: {bool(os.environ.get('OPENROUTER_API_KEY'))}")
else:
    print(f"[AI] WARNING: .env file not found at {_env_path}")

# Hardcoded fallback key (OpenRouter)
if not os.environ.get("OPENROUTER_API_KEY"):
    os.environ["OPENROUTER_API_KEY"] = "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"
    print("[AI] Using hardcoded fallback OPENROUTER_API_KEY")

SECRET_KEY = "timetable-secret-2026-xK9mP"
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "12345",
    "database": "timetable_db",
}

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
CORS(app)

# Connection pool
try:
    pool = pooling.MySQLConnectionPool(
        pool_name="ttpool", pool_size=5, pool_reset_session=True, **DB_CONFIG
    )
except mysql.connector.Error:
    pool = None
    print("[WARN] Could not create connection pool. Run init_db.py first.")


def get_db():
    if pool is None:
        raise Exception("Database not initialized. Run: python init_db.py")
    return pool.get_connection()


# ═══════════════════════════════════════════════
# Schema migrations — safely add missing columns
# ═══════════════════════════════════════════════
def run_migrations():
    """Add any columns that may be missing from older DB installs."""
    if pool is None:
        return
    migrations = [
        # (table, column, definition)
        ("faculty_mappings", "is_ta",       "BOOLEAN DEFAULT FALSE"),
        ("faculty_mappings", "combined_id",  "VARCHAR(50) DEFAULT ''"),
        ("courses",          "lab_type_id",  "VARCHAR(50) DEFAULT NULL"),
    ]
    try:
        conn = get_db()
        cur = conn.cursor()
        for table, column, definition in migrations:
            # Check if column exists
            cur.execute(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s",
                (table, column)
            )
            (exists,) = cur.fetchone()
            if not exists:
                cur.execute(f"ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}")
                print(f"[MIGRATION] Added column `{column}` to `{table}`")
            else:
                print(f"[MIGRATION] Column `{table}.{column}` already exists — skipping")
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[MIGRATION ERROR] {e}")

run_migrations()


# ═══════════════════════════════════════════════
# Auth helpers
# ═══════════════════════════════════════════════
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, username, role, name, email FROM users WHERE id=%s", (data["user_id"],))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if not user:
            return jsonify({"error": "User not found"}), 401
        return f(user, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# ═══════════════════════════════════════════════
# Static file serving
# ═══════════════════════════════════════════════
@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "login.html")

@app.route("/login.html")
def login_page():
    return send_from_directory(BASE_DIR, "login.html")

@app.route("/admin.html")
def admin_page():
    return send_from_directory(BASE_DIR, "admin.html")

@app.route("/teacher.html")
def teacher_page():
    return send_from_directory(BASE_DIR, "teacher.html")

@app.route("/student.html")
def student_page():
    return send_from_directory(BASE_DIR, "student.html")

@app.route("/css/<path:p>")
def css_files(p):
    resp = send_from_directory(os.path.join(BASE_DIR, "css"), p)
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp.headers["Pragma"] = "no-cache"
    return resp

@app.route("/js/<path:p>")
def js_files(p):
    return send_from_directory(os.path.join(BASE_DIR, "js"), p)

@app.route("/assets/<path:p>")
def asset_files(p):
    return send_from_directory(os.path.join(BASE_DIR, "assets"), p)


# ═══════════════════════════════════════════════
# AUTH endpoints
# ═══════════════════════════════════════════════
@app.route("/api/auth/login", methods=["POST"])
def api_login():
    body = request.json or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401
    token = jwt.encode(
        {"user_id": user["id"], "role": user["role"],
         "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        SECRET_KEY, algorithm="HS256",
    )
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "username": user["username"],
                 "role": user["role"], "name": user["name"]},
    })


@app.route("/api/auth/me")
@token_required
def api_me(current_user):
    result = dict(current_user)
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    if current_user["role"] == "teacher":
        cur.execute("SELECT id FROM faculty_mappings WHERE user_id=%s", (current_user["id"],))
        result["faculty_ids"] = [r["id"] for r in cur.fetchall()]
        section_ids = set()
        for fid in result["faculty_ids"]:
            cur.execute("SELECT section_id FROM faculty_sections WHERE faculty_id=%s", (fid,))
            for r in cur.fetchall():
                section_ids.add(r["section_id"])
        result["section_ids"] = list(section_ids)
    elif current_user["role"] == "student":
        cur.execute("SELECT section_id FROM student_sections WHERE user_id=%s", (current_user["id"],))
        result["section_ids"] = [r["section_id"] for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(result)


# ═══════════════════════════════════════════════
# BULK DATA — GET /api/data/all
# ═══════════════════════════════════════════════
@app.route("/api/data/all")
@token_required
def api_get_all(current_user):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # Courses
    cur.execute("SELECT * FROM courses")
    courses = cur.fetchall()
    for c in courses:
        c["theoryHours"] = c.pop("theory_hours")
        c["labHours"] = c.pop("lab_hours")
        c["theoryPeriods"] = c.pop("theory_periods")
        c["labPeriods"] = c.pop("lab_periods")
        c["labTypeId"] = c.pop("lab_type_id") or ""

    # Lab Types
    cur.execute("SELECT * FROM lab_types")
    lab_types = cur.fetchall()

    # Sections
    cur.execute("SELECT * FROM sections")
    sections = cur.fetchall()
    for s in sections:
        s["studentCount"] = s.pop("student_count")

    # Rooms
    cur.execute("SELECT * FROM rooms")
    rooms = cur.fetchall()
    for r in rooms:
        r["isLab"] = bool(r.pop("is_lab"))
        r["labTypeId"] = r.pop("lab_type_id") or ""

    # Combined classes
    cur.execute("SELECT * FROM combined_classes")
    combined = cur.fetchall()
    for cb in combined:
        cur.execute("SELECT section_id FROM combined_sections WHERE combined_id=%s", (cb["id"],))
        cb["sectionIds"] = [row["section_id"] for row in cur.fetchall()]

    # Faculty mappings
    cur.execute("SELECT * FROM faculty_mappings")
    faculty = cur.fetchall()
    for f in faculty:
        f["courseId"] = f.pop("course_id")
        f["isCombined"] = bool(f.pop("is_combined"))
        f["combinedId"] = f.pop("combined_id") or ""
        f["isTA"] = bool(f.pop("is_ta", False))
        cur.execute("SELECT section_id FROM faculty_sections WHERE faculty_id=%s", (f["id"],))
        f["sectionIds"] = [row["section_id"] for row in cur.fetchall()]
        f.pop("user_id", None)

    # Settings
    cur.execute("SELECT * FROM settings")
    raw_settings = {row["setting_key"]: row["setting_value"] for row in cur.fetchall()}
    settings = {}
    for k, v in raw_settings.items():
        try:
            settings[k] = json.loads(v)
        except (json.JSONDecodeError, TypeError):
            settings[k] = v
    if not settings:
        settings = {
            "daysOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "startTime": "09:30", "endTime": "18:30",
            "periodDuration": 60, "lunchStart": "13:30", "lunchEnd": "14:30",
        }

    # Locked slots
    cur.execute("SELECT * FROM locked_slots")
    locks = cur.fetchall()
    for lk in locks:
        lk["slotIdx"] = lk.pop("slot_idx")
        lk["facultyId"] = lk.pop("faculty_id")

    # Timetable entries
    cur.execute("SELECT * FROM timetable_entries")
    entries = cur.fetchall()
    timetable = {}
    for e in entries:
        e["courseId"] = e.pop("course_id")
        e["courseName"] = e.pop("course_name")
        e["type"] = e.pop("entry_type")
        e["facultyId"] = e.pop("faculty_id")
        e["facultyName"] = e.pop("faculty_name")
        e["slotIdx"] = e.pop("slot_idx")
        e["requiredSlots"] = e.pop("required_slots")
        e["roomId"] = e.pop("room_id")
        e["roomName"] = e.pop("room_name")
        e["isCombined"] = bool(e.pop("is_combined"))
        cur.execute("SELECT section_id FROM entry_sections WHERE entry_id=%s", (e["id"],))
        e["sectionIds"] = [row["section_id"] for row in cur.fetchall()]
        day = e["day"]
        timetable.setdefault(day, []).append(e)

    timetable = timetable if timetable else None

    cur.close()
    conn.close()

    return jsonify({
        "courses": courses, "sections": sections, "faculty": faculty,
        "rooms": rooms, "combined": combined, "settings": settings,
        "timetable": timetable, "locks": locks, "conflicts": [],
        "labTypes": lab_types,
    })


# ═══════════════════════════════════════════════
# BULK DATA — POST /api/data/all  (admin only)
# ═══════════════════════════════════════════════
@app.route("/api/data/all", methods=["POST"])
@token_required
@admin_required
def api_save_all(current_user):
    data = request.json or {}
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SET FOREIGN_KEY_CHECKS=0")

        # 1. Clear child tables FIRST to prevent cascade interference
        cur.execute("DELETE FROM entry_sections")
        cur.execute("DELETE FROM timetable_entries")
        cur.execute("DELETE FROM locked_slots")
        cur.execute("DELETE FROM faculty_sections")
        cur.execute("DELETE FROM faculty_mappings")
        cur.execute("DELETE FROM combined_sections")
        cur.execute("DELETE FROM combined_classes")
        cur.execute("DELETE FROM rooms")
        cur.execute("DELETE FROM courses")
        cur.execute("DELETE FROM sections")

        # 2. NOW safely clear and rebuild the parent table (Lab Types)
        cur.execute("DELETE FROM lab_types")
        for lt in data.get("labTypes", []):
            cur.execute(
                "INSERT INTO lab_types (id,name) VALUES (%s,%s)",
                (lt["id"], lt.get("name","")),
            )

        # 3. Rebuild Courses
        for c in data.get("courses", []):
            cur.execute(
                "INSERT INTO courses (id,name,code,theory_hours,lab_hours,theory_periods,lab_periods,lab_type_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (c["id"], c.get("name",""), c.get("code",""),
                 c.get("theoryHours",0), c.get("labHours",0),
                 c.get("theoryPeriods",1), c.get("labPeriods",2),
                 c.get("labTypeId","") or None),
            )

        # 4. Rebuild Sections
        for s in data.get("sections", []):
            cur.execute(
                "INSERT INTO sections (id,name,semester,student_count) VALUES (%s,%s,%s,%s)",
                (s["id"], s.get("name",""), s.get("semester",""), s.get("studentCount",0)),
            )

        # 5. Rebuild Rooms
        for r in data.get("rooms", []):
            cur.execute(
                "INSERT INTO rooms (id,name,capacity,is_lab,lab_type_id) VALUES (%s,%s,%s,%s,%s)",
                (r["id"], r.get("name",""), r.get("capacity",60), r.get("isLab", False),
                 r.get("labTypeId","") or None),
            )

        # 6. Rebuild Combined Classes
        for cb in data.get("combined", []):
            cur.execute("INSERT INTO combined_classes (id,name) VALUES (%s,%s)", (cb["id"], cb.get("name","")))
            for sid in cb.get("sectionIds", []):
                cur.execute("INSERT INTO combined_sections (combined_id,section_id) VALUES (%s,%s)", (cb["id"], sid))

        # 7. Rebuild Faculty
        for f in data.get("faculty", []):
            # Try to find existing teacher user by name
            cur2 = conn.cursor(dictionary=True)
            cur2.execute("SELECT id FROM users WHERE name=%s AND role='teacher'", (f.get("name",""),))
            urow = cur2.fetchone()
            cur2.close()
            user_id = urow["id"] if urow else None
            cur.execute(
                "INSERT INTO faculty_mappings (id,user_id,name,course_id,is_combined,combined_id,is_ta) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (f["id"], user_id, f.get("name",""), f.get("courseId",""),
                 f.get("isCombined", False), f.get("combinedId",""),
                 f.get("isTA", False)),
            )
            for sid in f.get("sectionIds", []):
                cur.execute("INSERT INTO faculty_sections (faculty_id,section_id) VALUES (%s,%s)", (f["id"], sid))

        # 8. Rebuild Settings
        cur.execute("DELETE FROM settings")
        settings = data.get("settings", {})
        if settings:
            for k, v in settings.items():
                cur.execute(
                    "INSERT INTO settings (setting_key,setting_value) VALUES (%s,%s)",
                    (k, json.dumps(v)),
                )

        # 9. Rebuild Locked Slots
        for lk in data.get("locks", []):
            cur.execute(
                "INSERT INTO locked_slots (id,day,slot_idx,faculty_id) VALUES (%s,%s,%s,%s)",
                (lk["id"], lk["day"], lk.get("slotIdx", lk.get("slot_idx", 0)), lk.get("facultyId", None)),
            )

        # 10. Rebuild Timetable Entries
        tt = data.get("timetable")
        if tt and isinstance(tt, dict):
            for day, entries in tt.items():
                for e in entries:
                    cur.execute(
                        "INSERT INTO timetable_entries (id,course_id,course_name,entry_type,faculty_id,faculty_name,day,slot_idx,required_slots,room_id,room_name,is_combined) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                        (e.get("id",""), e.get("courseId",""), e.get("courseName",""),
                         e.get("type","theory"), e.get("facultyId",""), e.get("facultyName",""),
                         day, e.get("slotIdx",0), e.get("requiredSlots",1),
                         e.get("roomId",""), e.get("roomName",""), e.get("isCombined", False)),
                    )
                    for sid in e.get("sectionIds", []):
                        cur.execute(
                            "INSERT INTO entry_sections (entry_id,section_id) VALUES (%s,%s)",
                            (e["id"], sid),
                        )

        cur.execute("SET FOREIGN_KEY_CHECKS=1")
        conn.commit()
    except Exception as ex:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(ex)}), 500
    cur.close()
    conn.close()
    return jsonify({"status": "ok"})


# ═══════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════
@app.route("/api/notifications")
@token_required
def api_get_notifications(current_user):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    if current_user["role"] == "admin":
        cur.execute("SELECT * FROM notifications ORDER BY created_at DESC")
    elif current_user["role"] == "teacher":
        # Get teacher's sections
        cur.execute("SELECT fm.id FROM faculty_mappings fm WHERE fm.user_id=%s", (current_user["id"],))
        fac_ids = [r["id"] for r in cur.fetchall()]
        sec_ids = []
        for fid in fac_ids:
            cur.execute("SELECT section_id FROM faculty_sections WHERE faculty_id=%s", (fid,))
            sec_ids.extend([r["section_id"] for r in cur.fetchall()])
        sec_ids = list(set(sec_ids))

        # Notifications targeted to: all, teachers, or their sections
        if sec_ids:
            placeholders = ",".join(["%s"] * len(sec_ids))
            cur.execute(
                f"""SELECT * FROM notifications
                    WHERE target_type='all' OR target_type='teachers'
                       OR (target_type='section' AND target_section_id IN ({placeholders}))
                       OR sender_id=%s
                    ORDER BY created_at DESC""",
                (*sec_ids, current_user["id"]),
            )
        else:
            cur.execute(
                """SELECT * FROM notifications
                   WHERE target_type='all' OR target_type='teachers' OR sender_id=%s
                   ORDER BY created_at DESC""",
                (current_user["id"],),
            )
    else:  # student
        cur.execute("SELECT section_id FROM student_sections WHERE user_id=%s", (current_user["id"],))
        sec_ids = [r["section_id"] for r in cur.fetchall()]
        if sec_ids:
            placeholders = ",".join(["%s"] * len(sec_ids))
            cur.execute(
                f"""SELECT * FROM notifications
                    WHERE target_type='all' OR target_type='students'
                       OR (target_type='section' AND target_section_id IN ({placeholders}))
                    ORDER BY created_at DESC""",
                tuple(sec_ids),
            )
        else:
            cur.execute(
                "SELECT * FROM notifications WHERE target_type='all' OR target_type='students' ORDER BY created_at DESC"
            )

    rows = cur.fetchall()
    for r in rows:
        r["created_at"] = r["created_at"].isoformat() if r["created_at"] else ""
    cur.close()
    conn.close()
    return jsonify(rows)


@app.route("/api/notifications", methods=["POST"])
@token_required
def api_create_notification(current_user):
    if current_user["role"] == "student":
        return jsonify({"error": "Students cannot send notifications"}), 403
    body = request.json or {}
    title = body.get("title", "").strip()
    message = body.get("message", "").strip()
    target_type = body.get("target_type", "all")
    target_section_id = body.get("target_section_id")
    if not title or not message:
        return jsonify({"error": "Title and message required"}), 400

    # Teachers can only target their own sections or all their students
    if current_user["role"] == "teacher" and target_type not in ("all", "students", "section"):
        target_type = "students"

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO notifications (sender_id,sender_name,sender_role,title,message,target_type,target_section_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (current_user["id"], current_user["name"], current_user["role"],
         title, message, target_type, target_section_id),
    )
    conn.commit()
    nid = cur.lastrowid
    cur.close()
    conn.close()
    return jsonify({"id": nid, "status": "created"}), 201


@app.route("/api/notifications/<int:nid>", methods=["DELETE"])
@token_required
def api_delete_notification(current_user, nid):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM notifications WHERE id=%s", (nid,))
    notif = cur.fetchone()
    if not notif:
        cur.close(); conn.close()
        return jsonify({"error": "Not found"}), 404
    # Admin can delete any; teachers can delete their own
    if current_user["role"] != "admin" and notif["sender_id"] != current_user["id"]:
        cur.close(); conn.close()
        return jsonify({"error": "Not authorized"}), 403
    cur.execute("DELETE FROM notifications WHERE id=%s", (nid,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "deleted"})


# ═══════════════════════════════════════════════
# USERS (admin only)
# ═══════════════════════════════════════════════
@app.route("/api/users")
@token_required
@admin_required
def api_get_users(current_user):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, username, role, name, email, created_at FROM users ORDER BY role, name")
    rows = cur.fetchall()
    for r in rows:
        r["created_at"] = r["created_at"].isoformat() if r["created_at"] else ""
    cur.close()
    conn.close()
    return jsonify(rows)


@app.route("/api/sections/list")
@token_required
def api_sections_list(current_user):
    """Simple section list for notification targeting."""
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name, semester FROM sections ORDER BY name")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)


# ═══════════════════════════════════════════════
# CLASS ALERTS (cancel / reschedule / TA assign)
# ═══════════════════════════════════════════════
@app.route("/api/class-alerts", methods=["POST"])
@token_required
def api_create_class_alert(current_user):
    if current_user["role"] != "teacher":
        return jsonify({"error": "Only teachers can create class alerts"}), 403
    body = request.json or {}
    alert_type   = body.get("alert_type", "cancelled")   # cancelled | rescheduled | ta_assigned
    course_name  = body.get("course_name", "").strip()
    day          = body.get("day", "").strip()
    slot_label   = body.get("slot_label", "").strip()
    message      = body.get("message", "").strip()
    target_type  = body.get("target_type", "section")
    target_section_id = body.get("target_section_id")
    ta_name      = body.get("ta_name", "").strip()
    substitute_name = body.get("substitute_name", "").strip()
    reschedule_to = body.get("reschedule_to", "").strip()

    # Build a rich title and message
    if alert_type == "cancelled":
        title = f"🚫 Class Cancelled – {course_name}"
        auto_msg = f"Your {course_name} class on {day} ({slot_label}) has been cancelled by {current_user['name']}."
    elif alert_type == "rescheduled":
        title = f"🔄 Class Rescheduled – {course_name}"
        auto_msg = f"Your {course_name} class originally on {day} ({slot_label}) has been rescheduled to {reschedule_to} by {current_user['name']}."
    elif alert_type == "ta_assigned":
        title = f"👤 TA Assigned – {course_name}"
        auto_msg = f"{ta_name} (TA) will take your {course_name} class on {day} ({slot_label}) in place of {current_user['name']}."
    elif alert_type == "substitute":
        title = f"🔁 Substitute Teacher – {course_name}"
        auto_msg = f"{substitute_name} will substitute for {current_user['name']} in {course_name} on {day} ({slot_label})."
    else:
        title = f"📢 Class Update – {course_name}"
        auto_msg = f"Update for {course_name} on {day} ({slot_label}) from {current_user['name']}."

    full_message = auto_msg + (f" Note: {message}" if message else "")

    conn = get_db()
    cur  = conn.cursor()
    cur.execute(
        """INSERT INTO notifications
               (sender_id, sender_name, sender_role, title, message,
                target_type, target_section_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (current_user["id"], current_user["name"], current_user["role"],
         title, full_message, target_type, target_section_id),
    )
    conn.commit()
    nid = cur.lastrowid
    cur.close(); conn.close()
    return jsonify({"id": nid, "status": "created"}), 201


# ═══════════════════════════════════════════════
# AI PROXY — forwards requests to OpenRouter
# ═══════════════════════════════════════════════
import urllib.request

@app.route("/api/ai/chat", methods=["POST"])
@token_required
def api_ai_chat(current_user):
    """Proxy AI calls through OpenRouter so the API key stays server-side."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        return jsonify({"error": "OPENROUTER_API_KEY not set on server"}), 500

    body = request.json or {}

    # Build OpenAI-compatible messages (OpenRouter uses OpenAI format)
    messages = []
    if "system" in body:
        messages.append({"role": "system", "content": str(body["system"])[:8000]})
    for m in body.get("messages", []):
        messages.append({"role": m["role"], "content": m["content"]})

    payload = {
        "model": "openrouter/auto",
        "max_tokens": min(int(body.get("max_tokens", 800)), 2000),
        "messages": messages,
    }

    try:
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "ScheduleAI",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        # Convert OpenAI response format → Anthropic format so frontend works unchanged
        text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        return jsonify({"content": [{"type": "text", "text": text}]})

    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return jsonify({"error": f"OpenRouter API error {e.code}: {err_body}"}), 502
    except Exception as ex:
        return jsonify({"error": str(ex)}), 502


# ═══════════════════════════════════════════════
# Run
# ═══════════════════════════════════════════════
if __name__ == "__main__":
    print("[*] Timetable Server starting on http://localhost:5000")
    print("    Login at http://localhost:5000/login.html")
    app.run(host="0.0.0.0", port=5000, debug=True)
