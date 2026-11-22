import os
import sys
import uuid
import secrets
import re
from functools import wraps
from datetime import datetime
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    send_from_directory,
    abort
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import database
import ai_service

# Load environment variables from .env file
load_dotenv()

# Initialize Flask web application
app = Flask(__name__)

# Secret key loaded securely from .env (fallback generates a random key if omitted)
app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))

# Enhanced cookie security settings to protect user session
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# Strictly limit uploaded PDF size to 5 Megabytes to prevent server overload
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

# Base directory where private medical reports are saved per user
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize database schema on startup
database.init_db()


# This decorator ensures a user is logged in before accessing protected pages
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please sign in to access your private health records.", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


# This before_request hook generates and checks CSRF tokens on all POST requests for safety
@app.before_request
def csrf_protect():
    # Make sure every active session has a secure random CSRF token
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(16)

    # Validate CSRF token on all form submissions (POST requests)
    if request.method == "POST":
        submitted_token = request.form.get("csrf_token")
        expected_token = session.get("csrf_token")
        if not submitted_token or submitted_token != expected_token:
            flash("Security verification failed. Please try submitting the form again.", "error")
            return redirect(request.referrer or url_for("dashboard"))


# This context processor provides user info and csrf_token to all HTML templates automatically
@app.context_processor
def inject_template_globals():
    return {
        "csrf_token": session.get("csrf_token", ""),
        "current_user_name": session.get("user_name", ""),
        "current_user_email": session.get("user_email", ""),
        "is_logged_in": "user_id" in session
    }


# This helper function validates basic email formatting
def is_valid_email(email):
    pattern = r"^[^@]+@[^@]+\.[^@]+$"
    return re.match(pattern, email.strip()) is not None


# Route: User Registration / Signup
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        # Validate form inputs
        if not (name and email and password and confirm_password):
            flash("All fields are required. Please complete the form.", "error")
            return render_template("signup.html", name=name, email=email)

        if not is_valid_email(email):
            flash("Please enter a valid email address.", "error")
            return render_template("signup.html", name=name, email=email)

        if len(password) < 8:
            flash("Password must be at least 8 characters long for security.", "error")
            return render_template("signup.html", name=name, email=email)

        if password != confirm_password:
            flash("Passwords do not match. Please re-enter them.", "error")
            return render_template("signup.html", name=name, email=email)

        # Check if email is already registered
        existing_user = database.get_user_by_email(email)
        if existing_user:
            flash("An account with this email already exists. Please log in.", "error")
            return redirect(url_for("login"))

        try:
            # Hash password securely using werkzeug
            password_hash = generate_password_hash(password)
            user_id = database.create_user(name, email, password_hash)

            # Automatically log the user into their fresh private account
            session["user_id"] = user_id
            session["user_name"] = name
            session["user_email"] = email

            flash(f"Welcome to HealthTrack AI, {name}! Your private account is ready.", "success")
            return redirect(url_for("dashboard"))
        except Exception as e:
            print(f"[HealthTrack Server Error] Signup failed: {e}", file=sys.stderr)
            flash("Could not create your account right now. Please try again.", "error")

    return render_template("signup.html")


# Route: User Login
@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not (email and password):
            flash("Please provide both email and password.", "error")
            return render_template("login.html", email=email)

        user = database.get_user_by_email(email)
        if user and check_password_hash(user["password_hash"], password):
            # Store logged-in user details in session
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            session["user_email"] = user["email"]
            flash(f"Welcome back, {user['name']}!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid email or password. Please try again.", "error")
            return render_template("login.html", email=email)

    return render_template("login.html")


# Route: User Logout
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been signed out securely.", "success")
    return redirect(url_for("login"))


# Route: Patient Dashboard showing only the current user's data
@app.route("/")
@login_required
def dashboard():
    user_id = session["user_id"]
    reports = database.get_all_reports(user_id)
    recent_tests = database.get_recent_tests(user_id, limit=5)
    reminders = database.get_all_reminders(user_id)

    return render_template(
        "dashboard.html",
        total_reports=len(reports),
        total_tests=len(database.get_all_tests(user_id)),
        total_reminders=len(reminders),
        recent_tests=recent_tests,
        reminders=reminders[:4]
    )


# Route: Medical Reports page to view and upload private PDF reports
@app.route("/reports", methods=["GET", "POST"])
@login_required
def reports():
    user_id = session["user_id"]

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        file = request.files.get("report_file")

        if not title:
            flash("Please enter a title for the medical report.", "error")
            return redirect(url_for("reports"))

        if not file or file.filename == "":
            flash("Please select a PDF report to upload.", "error")
            return redirect(url_for("reports"))

        # Verify extension is strictly .pdf
        filename = file.filename.lower()
        if not filename.endswith(".pdf"):
            flash("Only PDF files (.pdf) are permitted for medical reports.", "error")
            return redirect(url_for("reports"))

        try:
            # Save files in an isolated folder for each user: uploads/<user_id>/
            user_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], str(user_id))
            os.makedirs(user_upload_dir, exist_ok=True)

            # Generate an unpredictable unique filename to prevent overwriting and guessing
            random_filename = f"{uuid.uuid4().hex}.pdf"
            save_path = os.path.join(user_upload_dir, random_filename)
            file.save(save_path)

            upload_date = datetime.now().strftime("%Y-%m-%d")
            database.add_report(user_id, title, random_filename, upload_date)
            flash("Medical report uploaded securely!", "success")
        except Exception as e:
            print(f"[HealthTrack Server Error] File upload failed: {e}", file=sys.stderr)
            flash("Error saving report. Please verify file size is under 5MB.", "error")

        return redirect(url_for("reports"))

    user_reports = database.get_all_reports(user_id)
    return render_template("reports.html", reports=user_reports)


# Protected Route: Securely serve user's uploaded PDF file with ownership check
@app.route("/reports/<int:report_id>/file")
@login_required
def view_report_file(report_id):
    user_id = session["user_id"]
    report = database.get_report_by_id(report_id, user_id)

    # Prevent cross-user access: return 404 if report does not belong to logged-in user
    if not report:
        abort(404)

    user_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], str(user_id))
    file_path = os.path.join(user_upload_dir, report["file_path"])

    if not os.path.exists(file_path):
        abort(404)

    return send_from_directory(user_upload_dir, report["file_path"])


# Route: Analyze an uploaded PDF medical report using pypdf and Groq AI
@app.route("/reports/<int:report_id>/analyze", methods=["GET", "POST"])
@login_required
def analyze_report(report_id):
    user_id = session["user_id"]
    report = database.get_report_by_id(report_id, user_id)

    # Cross-user protection: return 404 if report does not belong to logged-in user
    if not report:
        abort(404)

    is_reanalyze = request.form.get("reanalyze") == "1" or request.args.get("reanalyze") == "1"

    # Use saved AI summary if already generated and re-analyze was not clicked
    if report["ai_summary"] and not is_reanalyze:
        return render_template(
            "report_analysis.html",
            report=report,
            analysis_text=report["ai_summary"],
            is_scanned=False
        )

    # Locate the PDF file in the user's private upload folder
    user_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], str(user_id))
    file_path = os.path.join(user_upload_dir, report["file_path"])

    if not os.path.exists(file_path):
        abort(404)

    # Extract text from the PDF file using pypdf
    extracted_text = ai_service.extract_text_from_pdf(file_path)

    # Check if the PDF has no readable text (e.g. scanned image or photo)
    if not extracted_text:
        scanned_msg = "This PDF looks like a scanned image. Please add the values using Manual Test Entry."
        return render_template(
            "report_analysis.html",
            report=report,
            analysis_text=scanned_msg,
            is_scanned=True
        )

    # Send extracted text to Groq Llama 3.3 for plain-English explanation
    try:
        analysis_result = ai_service.analyze_report_text(extracted_text)
        # Cache the result in the database so Groq is not called on every visit
        database.update_report_ai_summary(report_id, user_id, analysis_result)
        updated_report = database.get_report_by_id(report_id, user_id)
        return render_template(
            "report_analysis.html",
            report=updated_report,
            analysis_text=analysis_result,
            is_scanned=False
        )
    except Exception as e:
        print(f"[HealthTrack Server Error] PDF analysis failed: {e}", file=sys.stderr)
        flash("Could not complete AI analysis at this time. Please try again later.", "error")
        return redirect(url_for("reports"))


# Route: Delete a medical report with strict ownership check
@app.route("/reports/<int:report_id>/delete", methods=["POST"])
@login_required
def delete_report(report_id):
    user_id = session["user_id"]
    report = database.get_report_by_id(report_id, user_id)

    # If the report does not belong to the user, return 404
    if not report:
        abort(404)

    try:
        # Delete the physical file from the user's isolated folder
        user_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], str(user_id))
        physical_path = os.path.join(user_upload_dir, report["file_path"])
        if os.path.exists(physical_path):
            os.remove(physical_path)

        database.delete_report(report_id, user_id)
        flash("Medical report deleted.", "success")
    except Exception as e:
        print(f"[HealthTrack Server Error] Delete report failed: {e}", file=sys.stderr)
        flash("Could not delete report right now.", "error")

    return redirect(url_for("reports"))


# Route: Manual lab test entry form for the logged-in user
@app.route("/add-test", methods=["GET", "POST"])
@login_required
def add_test():
    user_id = session["user_id"]

    if request.method == "POST":
        test_name = request.form.get("test_name", "").strip()
        value = request.form.get("value", "").strip()
        unit = request.form.get("unit", "").strip()
        test_date = request.form.get("test_date", "").strip()
        ref_min = request.form.get("ref_min", "").strip()
        ref_max = request.form.get("ref_max", "").strip()

        if not (test_name and value and unit and test_date and ref_min and ref_max):
            flash("All fields are required. Please fill in the complete form.", "error")
            return redirect(url_for("add_test"))

        try:
            database.add_test(user_id, test_name, value, unit, test_date, ref_min, ref_max)
            flash(f"Test record for '{test_name}' saved to your private profile!", "success")
            return redirect(url_for("dashboard"))
        except Exception as e:
            print(f"[HealthTrack Server Error] Add test failed: {e}", file=sys.stderr)
            flash("Could not save test record. Please check the values entered.", "error")
            return redirect(url_for("add_test"))

    user_tests = database.get_all_tests(user_id)
    return render_template("add_test.html", tests=user_tests)


# Route: Delete a test entry with strict ownership check
@app.route("/tests/<int:test_id>/delete", methods=["POST"])
@login_required
def delete_test(test_id):
    user_id = session["user_id"]
    deleted = database.delete_test(test_id, user_id)

    if not deleted:
        abort(404)

    flash("Test entry deleted.", "success")
    return redirect(url_for("add_test"))


# Route: AI Report Analyzer analyzing only the logged-in user's recent tests
@app.route("/analyze")
@login_required
def analyze():
    user_id = session["user_id"]
    tests = database.get_recent_tests(user_id, limit=10)
    ai_result = None

    if tests:
        try:
            ai_result = ai_service.analyze_health_reports(tests)
        except Exception as e:
            print(f"[HealthTrack Server Error] AI Analysis failed: {e}", file=sys.stderr)
            ai_result = "AI analysis could not be completed. Please try again later."

    return render_template("analyze.html", tests=tests, ai_result=ai_result)


# Route: Health History Comparison comparing only the logged-in user's readings
@app.route("/history")
@login_required
def history():
    user_id = session["user_id"]
    distinct_tests = database.get_distinct_test_names(user_id)
    selected_test = request.args.get("test_name")

    if not selected_test and distinct_tests:
        selected_test = distinct_tests[0]

    test_records = []
    trend_status = "No data"
    chart_dates = []
    chart_values = []
    ref_min_val = 0
    ref_max_val = 0
    unit_val = ""

    if selected_test:
        test_records = database.get_tests_by_name(user_id, selected_test)

        if test_records:
            ref_min_val = test_records[0]["ref_min"]
            ref_max_val = test_records[0]["ref_max"]
            unit_val = test_records[0]["unit"]

            for r in test_records:
                chart_dates.append(r["test_date"])
                chart_values.append(r["value"])

            if len(test_records) >= 2:
                prev_val = test_records[-2]["value"]
                curr_val = test_records[-1]["value"]
                ref_mid = (ref_min_val + ref_max_val) / 2.0

                prev_dist = abs(prev_val - ref_mid)
                curr_dist = abs(curr_val - ref_mid)

                if abs(curr_val - prev_val) < 0.01:
                    trend_status = "Stable"
                elif curr_dist < prev_dist:
                    trend_status = "Improved"
                else:
                    trend_status = "Worsened"
            else:
                trend_status = "Single Record (Add 1 more to compare)"

    return render_template(
        "history.html",
        distinct_tests=distinct_tests,
        selected_test=selected_test,
        test_records=test_records,
        trend_status=trend_status,
        chart_dates=chart_dates,
        chart_values=chart_values,
        ref_min=ref_min_val,
        ref_max=ref_max_val,
        unit=unit_val
    )


# Route: AI Diet Suggestions tailored to current user's preference and records
@app.route("/diet", methods=["GET", "POST"])
@login_required
def diet():
    user_id = session["user_id"]
    preference = "vegetarian"
    notes = ""
    diet_plan = None

    if request.method == "POST":
        preference = request.form.get("preference", "vegetarian")
        notes = request.form.get("notes", "").strip()

        recent_tests = database.get_recent_tests(user_id, limit=5)
        try:
            diet_plan = ai_service.generate_diet_suggestions(recent_tests, preference, notes)
        except Exception as e:
            print(f"[HealthTrack Server Error] Diet suggestions failed: {e}", file=sys.stderr)
            diet_plan = "Could not generate diet suggestions right now."

    return render_template("diet.html", preference=preference, notes=notes, diet_plan=diet_plan)


# Route: Checkup reminders list and scheduling for current user
@app.route("/reminders", methods=["GET", "POST"])
@login_required
def reminders():
    user_id = session["user_id"]

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        checkup_date = request.form.get("checkup_date", "").strip()
        notes = request.form.get("notes", "").strip()

        if not (title and checkup_date):
            flash("Title and Checkup Date are required.", "error")
            return redirect(url_for("reminders"))

        try:
            database.add_reminder(user_id, title, checkup_date, notes)
            flash("Checkup reminder added!", "success")
        except Exception as e:
            print(f"[HealthTrack Server Error] Add reminder failed: {e}", file=sys.stderr)
            flash("Could not add reminder. Please try again.", "error")

        return redirect(url_for("reminders"))

    user_reminders = database.get_all_reminders(user_id)
    return render_template("reminders.html", reminders=user_reminders)


# Route: Delete a checkup reminder with ownership check
@app.route("/reminders/<int:reminder_id>/delete", methods=["POST"])
@login_required
def delete_reminder(reminder_id):
    user_id = session["user_id"]
    deleted = database.delete_reminder(reminder_id, user_id)

    if not deleted:
        abort(404)

    flash("Reminder deleted.", "success")
    return redirect(url_for("reminders"))


# Error Handler: 404 Not Found (Unauthorized or nonexistent record access)
@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html"), 404


# Error Handler: 413 File Too Large (Exceeds 5MB limit)
@app.errorhandler(413)
def file_too_large(error):
    flash("The uploaded file exceeds the 5 MB maximum limit. Please choose a smaller PDF.", "error")
    return redirect(url_for("reports"))


# Error Handler: 500 Server Error (Friendly generic message without leaking internals)
@app.errorhandler(500)
def internal_error(error):
    return render_template("500.html"), 500


# Run local Flask development server with debug=False for safety
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
