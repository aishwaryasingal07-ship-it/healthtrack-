# HealthTrack AI - Smart Healthcare Analyzer (Multi-User AI Edition)

A simple, modern, beginner-friendly web application for storing medical reports, reading PDF laboratory results with `pypdf`, analyzing health trends with Groq Llama 3.3, and planning personalized Indian diets.

Built specifically for a second-year B.Tech computer science project with clean code, standard conventions, and plain English comments.

---

## 🛠️ Technology Stack

| Component | Technology Used | Why Chosen |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Google Font (Poppins) | Native web standards, zero build tools or heavy frameworks |
| **Backend** | Python 3, Flask, `werkzeug.security` | Built-in Flask modules, clean routes, secure password hashing |
| **Database** | SQLite3 (`healthtrack.db`) with Foreign Keys | Built-in Python library, relational user isolation |
| **PDF Extraction** | `pypdf` (PdfReader) | Lightweight pure-Python PDF reader, page-by-page text parser |
| **AI Engine** | Groq Python SDK (`llama-3.3-70b-versatile`) | Lightning-fast Llama 3.3 inference with educational prompting |
| **Charts** | Chart.js (via CDN) | Dynamic, responsive line charts for personal health history |

---

## 📂 Project Folder Structure

```text
healthtrack/
├── app.py              # Main Flask application with auth, PDF analysis, and user-scoped routes
├── database.py         # SQLite connection, schema (with ai_summary), and helper queries
├── ai_service.py       # pypdf text extraction and Groq Llama 3.3 report analyzer
├── .env.example        # Environment variable template for GROQ_API_KEY & FLASK_SECRET_KEY
├── .gitignore          # Ignores .env, *.db, uploads/, __pycache__/, venv/
├── requirements.txt    # Allowed packages: flask, groq, python-dotenv, pypdf
├── README.md           # Documentation, viva guide, and setup instructions
├── uploads/            # Private local storage structured per user (uploads/<user_id>/)
├── templates/          # Jinja2 HTML templates
│   ├── base.html       # Dynamic auth navbar, Google Font Poppins, flash notifications
│   ├── login.html      # Secure sign in form with CSRF token
│   ├── signup.html     # User registration with privacy guarantee
│   ├── dashboard.html  # Statistics cards with colored accents (blue, teal, orange, purple)
│   ├── reports.html    # Upload PDFs, view status, and "Analyze with AI" action
│   ├── report_analysis.html # Detailed AI breakdown of extracted PDF report text
│   ├── add_test.html   # Manual laboratory test entry with presets
│   ├── analyze.html    # Overall health analysis for manual tests
│   ├── history.html    # Chart.js trend line graph & Improved/Worsened status
│   ├── diet.html       # Indian meal planner (Veg, Non-Veg, Vegan)
│   ├── reminders.html  # Upcoming checkup scheduling and management
│   ├── 404.html        # Custom security page for unauthorized or missing records
│   └── 500.html        # Friendly error page without leaking server stack traces
└── static/
    ├── style.css       # Colorful healthcare theme (gradients, card borders, Poppins font)
    └── script.js       # Chart.js configuration and AI loading spinners
```

---

## 🚀 Quick Setup & Installation Guide

### 1. Upgrade from Old Database (Important)
Because of the new `ai_summary` column in the `reports` table, delete the old database file once so the updated multi-user schema is created fresh:
```bash
# On Windows Command Prompt:
del healthtrack.db

# On macOS/Linux:
rm -f healthtrack.db
```

### 2. Install Packages
```bash
cd healthtrack
pip install -r requirements.txt
```
*(Packages installed: `flask`, `groq`, `python-dotenv`, `pypdf`)*

### 3. Configure `.env`
Copy `.env.example` to `.env`:
```bash
# On Windows:
copy .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Open `.env` and configure your keys:
```env
# Free Groq key from https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here

# Any long random string for securing user session cookies
FLASK_SECRET_KEY=my_secure_btech_random_secret_string_2025
```

### 4. Run the Application
```bash
python app.py
```
Visit **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser!

---

## 📄 PDF Analysis (Viva Presentation Guide)

Here is how the automated PDF analysis works from end to end:

```
[ User clicks "Analyze with AI" in Reports ]
                    │
                    ▼
[ Route: POST /reports/<id>/analyze ]
  1. Validates @login_required & CSRF token
  2. Verifies ownership (WHERE user_id = ?)
  3. Checks if ai_summary is already saved in SQLite
     (if already cached, displays it immediately without calling Groq)
                    │
                    ▼
[ ai_service.extract_text_from_pdf(file_path) ]
  4. Opens the PDF using pypdf.PdfReader
  5. Loops over each page and concatenates page.extract_text()
  6. Checks if extracted text is empty or None
     ├─ If empty (scanned image): Displays "This PDF looks like a scanned image.
     │  Please add the values using Manual Test Entry."
     └─ If text found: Continues to AI analysis
                    │
                    ▼
[ ai_service.analyze_report_text(text) ]
  7. Truncates text to the first 6,000 characters to stay within safe token limits
  8. Prompts Groq llama-3.3-70b-versatile with strict 10th-grade educational rules:
     - Identify test names, measured values, units, and reference ranges
     - Highlight out-of-range vs normal numbers
     - Strictly NO disease diagnosis or medicine prescription
     - Include mandatory disclaimer: "AI-generated information, not medical advice.
       Please consult your doctor."
                    │
                    ▼
[ SQLite Database: reports table ]
  9. Result is cached in reports.ai_summary so Groq is called only once per report
  10. User can click "Re-analyze with AI" anytime to refresh the summary
```

---

## 🎨 Colorful Healthcare Styling (CSS Architecture)

The app's visual design was enhanced exclusively through vanilla CSS in `static/style.css`:
- **CSS Variables (`:root`)**: Centrally defined palette for Primary Blue (`#0284c7`), Healthcare Teal (`#0d9488`), AI Purple (`#7c3aed`), Diagnostic Orange (`#ea580c`), Healthy Green (`#10b981`), and Alert Red (`#ef4444`).
- **Gradient Backgrounds**: Soft light gradient from blue to mint (`#f0f7ff` to `#f0fdf9`) and a navbar gradient (`linear-gradient(135deg, #0284c7 0%, #0d9488 100%)`).
- **Card Accent Borders**: Distinct colored top borders (`card-blue`, `card-teal`, `card-purple`, `card-orange`) and a smooth hover-lift effect (`translateY(-3px)`).
- **Vibrant Buttons**: Gradient-filled action buttons with responsive click feedback.
- **Table Polish**: Gradient table headers, alternating row striping, and row hover highlights.
- **Typography**: Clean Google Font (`Poppins`) loaded via a single `<link>` in `base.html`.
- **Responsive Layout**: Fluid flexbox and grid layouts adapted for mobile and desktop screens via a single clean media query.
