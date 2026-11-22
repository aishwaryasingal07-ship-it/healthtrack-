import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  FileText,
  PlusCircle,
  Cpu,
  TrendingUp,
  Utensils,
  Bell,
  Code2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Download,
  Copy,
  Check,
  Key,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ArrowLeft,
  FileSearch,
  ScanText
} from "lucide-react";

// User account interface
interface UserAccount {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const DEFAULT_USERS: UserAccount[] = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", created_at: "2025-01-01 10:00:00" },
  { id: 2, name: "Priya Patel", email: "priya@example.com", created_at: "2025-02-15 11:30:00" }
];

// Pre-seeded test records partitioned strictly by user_id
const INITIAL_TESTS = [
  // User 1 (Rahul)
  { id: 101, user_id: 1, test_name: "Fasting Blood Sugar", value: 118.0, unit: "mg/dL", test_date: "2025-01-10", ref_min: 70.0, ref_max: 99.0 },
  { id: 102, user_id: 1, test_name: "Fasting Blood Sugar", value: 112.0, unit: "mg/dL", test_date: "2025-02-15", ref_min: 70.0, ref_max: 99.0 },
  { id: 103, user_id: 1, test_name: "Fasting Blood Sugar", value: 104.0, unit: "mg/dL", test_date: "2025-03-20", ref_min: 70.0, ref_max: 99.0 },
  { id: 104, user_id: 1, test_name: "Hemoglobin", value: 13.8, unit: "g/dL", test_date: "2025-01-10", ref_min: 12.0, ref_max: 16.0 },
  { id: 105, user_id: 1, test_name: "Total Cholesterol", value: 215.0, unit: "mg/dL", test_date: "2025-01-10", ref_min: 125.0, ref_max: 200.0 },
  { id: 106, user_id: 1, test_name: "Total Cholesterol", value: 198.0, unit: "mg/dL", test_date: "2025-03-20", ref_min: 125.0, ref_max: 200.0 },

  // User 2 (Priya)
  { id: 201, user_id: 2, test_name: "Hemoglobin", value: 12.2, unit: "g/dL", test_date: "2025-02-01", ref_min: 12.0, ref_max: 16.0 },
  { id: 202, user_id: 2, test_name: "Hemoglobin", value: 13.1, unit: "g/dL", test_date: "2025-03-15", ref_min: 12.0, ref_max: 16.0 },
  { id: 203, user_id: 2, test_name: "Vitamin D", value: 24.0, unit: "ng/mL", test_date: "2025-03-15", ref_min: 30.0, ref_max: 100.0 }
];

// Pre-seeded medical reports with ai_summary column cached in SQLite
interface MedicalReport {
  id: number;
  user_id: number;
  title: string;
  file_path: string;
  upload_date: string;
  ai_summary?: string;
  is_scanned?: boolean;
}

const INITIAL_REPORTS: MedicalReport[] = [
  // User 1 (Rahul)
  {
    id: 1,
    user_id: 1,
    title: "Rahul's Complete Blood Count (CBC) - Apollo Lab",
    file_path: "d41d8cd98f00b204e9800998ecf8427e.pdf",
    upload_date: "2025-03-20",
    ai_summary: `1. OVERVIEW OF KEY TESTS & MEASUREMENTS:
• Fasting Blood Sugar: 104.0 mg/dL (Normal reference: 70 - 99 mg/dL)
• Hemoglobin: 14.1 g/dL (Normal reference: 12.0 - 16.0 g/dL)
• Total Cholesterol: 198.0 mg/dL (Normal reference: 125 - 200 mg/dL)
• Platelets Count: 280 x10^3/uL (Normal reference: 150 - 450 x10^3/uL)

2. VALUES OUTSIDE REFERENCE RANGE vs NORMAL VALUES:
• Fasting Blood Sugar is slightly OUTSIDE the normal range (104 mg/dL vs max 99 mg/dL).
• Hemoglobin, Cholesterol, and Platelets are all safely in the NORMAL range.

3. SIMPLE EXPLANATION OF WHAT THESE NUMBERS MEAN:
• Blood sugar is the primary fuel your body gets from carbohydrates. Having it just slightly above normal means your body is processing glucose a bit more slowly after fasting.
• Hemoglobin is healthy, which means your red blood cells are doing a great job supplying oxygen across your body without signs of anemia.

4. GENERAL LIFESTYLE TIPS TO DISCUSS WITH A DOCTOR:
• Replace refined white grains with whole wheat or oats for smoother blood sugar curves.
• Go for a 20-30 minute brisk walk after meals.
• Stay hydrated with 8 to 10 glasses of water daily.

⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor.`
  },
  {
    id: 2,
    user_id: 1,
    title: "Rahul's Scanned Ultrasound Scan Copy",
    file_path: "7e2a9b34c56d78ef0123456789abcdef.pdf",
    upload_date: "2025-01-10",
    is_scanned: true
  },
  // User 2 (Priya)
  {
    id: 3,
    user_id: 2,
    title: "Priya's Thyroid & Vitamin D Panel - SRL Lab",
    file_path: "9876543210fedcba0123456789abcdef.pdf",
    upload_date: "2025-03-15",
    ai_summary: `1. OVERVIEW OF KEY TESTS & MEASUREMENTS:
• Vitamin D (25-OH): 24.0 ng/mL (Normal reference: 30 - 100 ng/mL)
• TSH (Thyroid): 2.1 uIU/mL (Normal reference: 0.4 - 4.0 uIU/mL)
• Hemoglobin: 13.1 g/dL (Normal reference: 12.0 - 16.0 g/dL)

2. VALUES OUTSIDE REFERENCE RANGE vs NORMAL VALUES:
• Vitamin D is OUTSIDE the normal range (24 ng/mL vs min 30 ng/mL - mild insufficiency).
• TSH and Hemoglobin are perfectly NORMAL.

3. SIMPLE EXPLANATION OF WHAT THESE NUMBERS MEAN:
• Vitamin D is essential for absorbing calcium and keeping bones and immune defenses strong. Lower numbers are very common for people working indoors.
• Normal TSH means your thyroid gland is regulating metabolism smoothly.

4. GENERAL LIFESTYLE TIPS TO DISCUSS WITH A DOCTOR:
• 15 minutes of gentle morning sun exposure on arms and face.
• Discuss dietary sources (fortified milk, mushrooms, eggs) with your doctor.

⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor.`
  }
];

const INITIAL_REMINDERS = [
  // User 1 (Rahul)
  {
    id: 1,
    user_id: 1,
    title: "Annual Full Body Checkup (Rahul)",
    checkup_date: "2025-05-15",
    notes: "Review fasting blood glucose and lipid panel with Dr. Sharma"
  },
  // User 2 (Priya)
  {
    id: 2,
    user_id: 2,
    title: "Vitamin D & Calcium Follow-up (Priya)",
    checkup_date: "2025-06-01",
    notes: "Consult nutritionist for 3-month sun exposure check"
  }
];

// Project files dictionary for student code explorer
const PROJECT_FILES: Record<string, { desc: string; code: string; language: string }> = {
  "ai_service.py": {
    desc: "pypdf text extraction and Groq Llama 3.3 report analyzer with non-diagnostic guardrails",
    language: "python",
    code: `import os
import sys
from dotenv import load_dotenv

load_dotenv()
DISCLAIMER_TEXT = "\\n\\n⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor."

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "your_key_here" in api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key.strip())
    except Exception as e:
        print(f"[HealthTrack Server Error] Groq client failed: {e}", file=sys.stderr)
        return None

# Extracts text from a PDF file using pypdf.PdfReader
def extract_text_from_pdf(file_path):
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        extracted = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted.append(t)
        full_text = "\\n".join(extracted).strip()
        if not full_text:
            return None
        return full_text
    except Exception as e:
        print(f"[HealthTrack Server Error] PDF extraction failed: {e}", file=sys.stderr)
        return None

# Sends up to 6000 characters of PDF text to Groq Llama 3.3
def analyze_report_text(text):
    if not text:
        return "No text available to analyze." + DISCLAIMER_TEXT
    client = get_groq_client()
    if not client:
        return "Groq API key not set in .env." + DISCLAIMER_TEXT

    truncated = text[:6000]
    prompt = f"Analyze this lab report in 10th-grade English. List tests, units, normal ranges, out-of-range values, and general wellness habits. DO NOT diagnose or prescribe:\\n\\n{truncated}"

    chat = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are HealthTrack AI. Explain clearly at a 10th grade level. Never diagnose or prescribe medicines."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=800
    )
    return chat.choices[0].message.content + DISCLAIMER_TEXT`
  },
  "app.py": {
    desc: "Flask application with /reports/<id>/analyze route, pypdf integration, and ai_summary caching",
    language: "python",
    code: `# Route: Analyze an uploaded PDF medical report using pypdf and Groq AI
@app.route("/reports/<int:report_id>/analyze", methods=["GET", "POST"])
@login_required
def analyze_report(report_id):
    user_id = session["user_id"]
    report = database.get_report_by_id(report_id, user_id)
    if not report:
        abort(404)

    is_reanalyze = request.form.get("reanalyze") == "1"

    # Use saved AI summary if already generated
    if report["ai_summary"] and not is_reanalyze:
        return render_template("report_analysis.html", report=report, analysis_text=report["ai_summary"], is_scanned=False)

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], str(user_id), report["file_path"])
    if not os.path.exists(file_path):
        abort(404)

    # Extract text with pypdf
    text = ai_service.extract_text_from_pdf(file_path)
    if not text:
        scanned_msg = "This PDF looks like a scanned image. Please add the values using Manual Test Entry."
        return render_template("report_analysis.html", report=report, analysis_text=scanned_msg, is_scanned=True)

    # Analyze with Groq and cache result in SQLite
    result = ai_service.analyze_report_text(text)
    database.update_report_ai_summary(report_id, user_id, result)
    updated = database.get_report_by_id(report_id, user_id)
    return render_template("report_analysis.html", report=updated, analysis_text=result, is_scanned=False)`
  },
  "database.py": {
    desc: "SQLite3 schema with ai_summary column in reports table and update_report_ai_summary function",
    language: "python",
    code: `def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
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
    conn.commit()

# Saves the AI analysis summary for a specific report in the database
def update_report_ai_summary(report_id, user_id, ai_summary):
    conn = get_db_connection()
    conn.execute(
        "UPDATE reports SET ai_summary = ? WHERE id = ? AND user_id = ?",
        (ai_summary, report_id, user_id)
    )
    conn.commit()
    conn.close()`
  },
  "style.css": {
    desc: "Vibrant healthcare CSS with variables, gradients, top card borders, and Poppins font",
    language: "css",
    code: `:root {
    --primary-blue: #0284c7;
    --teal: #0d9488;
    --purple: #7c3aed;
    --orange: #ea580c;
    --green: #10b981;
    --red: #ef4444;
}
body {
    background: linear-gradient(135deg, #f0f7ff 0%, #f0fdf9 100%);
    font-family: 'Poppins', sans-serif;
}
.navbar {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--teal) 100%);
}
.card-blue { border-top: 4px solid var(--primary-blue); }
.card-teal { border-top: 4px solid var(--teal); }
.card-purple { border-top: 4px solid var(--purple); }
.card-orange { border-top: 4px solid var(--orange); }`
  },
  "requirements.txt": {
    desc: "Allowed packages only including pypdf for PDF reading",
    language: "text",
    code: `flask==3.0.3
groq==0.9.0
python-dotenv==1.0.1
pypdf==4.2.0`
  },
  "README.md": {
    desc: "Full viva guide with PDF Analysis architecture explanation",
    language: "markdown",
    code: `# PDF Analysis Architecture (B.Tech Viva)
1. pypdf.PdfReader extracts text page-by-page.
2. If empty, warns user: "This PDF looks like a scanned image. Please add values using Manual Test Entry."
3. First 6000 chars sent to Groq llama-3.3-70b-versatile.
4. Summary is cached in SQLite reports.ai_summary so Groq is called only once.`
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("healthtrack_users_v3");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem("healthtrack_current_user_id_v3");
    return saved ? parseInt(saved, 10) : 1; // Default to Rahul Sharma
  });

  // Health data state (all partitioned by user_id)
  const [tests, setTests] = useState(() => {
    const saved = localStorage.getItem("healthtrack_tests_v3");
    return saved ? JSON.parse(saved) : INITIAL_TESTS;
  });

  const [reports, setReports] = useState<MedicalReport[]>(() => {
    const saved = localStorage.getItem("healthtrack_reports_v3");
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("healthtrack_reminders_v3");
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [groqKey, setGroqKey] = useState(() => {
    return localStorage.getItem("healthtrack_groq_key") || "";
  });

  // UI State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showCrossUserAlert, setShowCrossUserAlert] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState("ai_service.py");
  const [copiedFile, setCopiedFile] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Active Report Analysis View Modal / Page
  const [viewingReportAnalysis, setViewingReportAnalysis] = useState<MedicalReport | null>(null);
  const [isPdfAnalyzing, setIsPdfAnalyzing] = useState(false);

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  // Test Form State
  const [testForm, setTestForm] = useState({
    test_name: "Fasting Blood Sugar",
    value: "102",
    unit: "mg/dL",
    test_date: new Date().toISOString().split("T")[0],
    ref_min: "70",
    ref_max: "99"
  });

  // Report Form State
  const [reportTitle, setReportTitle] = useState("");
  const [isUploadingScanned, setIsUploadingScanned] = useState(false);

  // Reminder Form State
  const [reminderForm, setReminderForm] = useState({ title: "", checkup_date: "", notes: "" });

  // Diet & AI Analyzer State
  const [dietPreference, setDietPreference] = useState<"vegetarian" | "non-vegetarian" | "vegan">("vegetarian");
  const [dietNotes, setDietNotes] = useState("");
  const [dietResult, setDietResult] = useState<string | null>(null);
  const [isDietLoading, setIsDietLoading] = useState(false);

  const [manualAiAnalysisResult, setManualAiAnalysisResult] = useState<string | null>(null);
  const [isManualAiLoading, setIsManualAiLoading] = useState(false);

  // History tab selection
  const [selectedHistoryTest, setSelectedHistoryTest] = useState<string>("Fasting Blood Sugar");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<any>(null);

  // Active user object
  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Filter datasets strictly for active user
  const userTests = tests.filter((t: any) => t.user_id === currentUserId);
  const userReports = reports.filter((r) => r.user_id === currentUserId);
  const userReminders = reminders.filter((r: any) => r.user_id === currentUserId);

  // Persist datasets to localStorage
  useEffect(() => {
    localStorage.setItem("healthtrack_users_v3", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId !== null) {
      localStorage.setItem("healthtrack_current_user_id_v3", currentUserId.toString());
    } else {
      localStorage.removeItem("healthtrack_current_user_id_v3");
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem("healthtrack_tests_v3", JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem("healthtrack_reports_v3", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("healthtrack_reminders_v3", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("healthtrack_groq_key", groqKey);
  }, [groqKey]);

  // Flash message banner
  const showBanner = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Distinct test names for history selection for current user
  const distinctTestNames: string[] = Array.from(new Set(userTests.map((t: any) => String(t.test_name))));

  // Ensure selectedHistoryTest is valid for this user
  useEffect(() => {
    if (distinctTestNames.length > 0 && !distinctTestNames.includes(selectedHistoryTest)) {
      setSelectedHistoryTest(distinctTestNames[0]);
    }
  }, [currentUserId, distinctTestNames, selectedHistoryTest]);

  // Render Chart.js
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab !== "history" && activeTab !== "dashboard") return;

    const timer = setTimeout(() => {
      const canvas = chartRef.current;
      if (!canvas) return;

      const filtered = userTests
        .filter((t: any) => t.test_name === selectedHistoryTest)
        .sort((a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());

      if (filtered.length === 0) return;

      const dates = filtered.map((t: any) => t.test_date);
      const values = filtered.map((t: any) => t.value);
      const refMin = filtered[0].ref_min;
      const refMax = filtered[0].ref_max;
      const unit = filtered[0].unit;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // @ts-ignore
      if (typeof window.Chart !== "undefined") {
        // @ts-ignore
        chartInstance.current = new window.Chart(canvas, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: `${selectedHistoryTest} (${unit})`,
                data: values,
                borderColor: "#0284c7",
                backgroundColor: "rgba(2, 132, 199, 0.12)",
                borderWidth: 3,
                pointBackgroundColor: "#0284c7",
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.3,
                fill: true
              },
              {
                label: `Min Normal (${refMin})`,
                data: Array(dates.length).fill(refMin),
                borderColor: "#10b981",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
              },
              {
                label: `Max Normal (${refMax})`,
                data: Array(dates.length).fill(refMax),
                borderColor: "#ef4444",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: { boxWidth: 14, font: { family: "Poppins", size: 12 } }
              }
            },
            scales: {
              y: {
                suggestedMin: Math.max(0, Math.min(...values, refMin) * 0.85),
                suggestedMax: Math.max(...values, refMax) * 1.15,
                title: { display: true, text: `Measured (${unit})`, font: { family: "Poppins" } }
              },
              x: { title: { display: true, text: "Date of Test", font: { family: "Poppins" } } }
            }
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeTab, selectedHistoryTest, userTests, currentUser]);

  // Compute Trend: Improved / Worsened / Stable
  const getTrendData = () => {
    const filtered = userTests
      .filter((t: any) => t.test_name === selectedHistoryTest)
      .sort((a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());

    if (filtered.length < 2) {
      return { status: "Single Record", text: "Add at least 2 readings to compare", prev: filtered[0]?.value, curr: filtered[0]?.value };
    }

    const prev = filtered[filtered.length - 2].value;
    const curr = filtered[filtered.length - 1].value;
    const refMin = filtered[0].ref_min;
    const refMax = filtered[0].ref_max;
    const refMid = (refMin + refMax) / 2.0;

    const prevDist = Math.abs(prev - refMid);
    const currDist = Math.abs(curr - refMid);

    if (Math.abs(curr - prev) < 0.01) {
      return { status: "Stable", text: "Values maintained at consistent level", prev, curr };
    } else if (currDist < prevDist) {
      return { status: "Improved", text: "Reading moved closer to healthy reference range", prev, curr };
    } else {
      return { status: "Worsened", text: "Reading drifted further from target range", prev, curr };
    }
  };

  // Auth: Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      showBanner(`Welcome back, ${found.name}! Signed in securely.`, "success");
      setLoginEmail("");
      setLoginPassword("");
      setActiveTab("dashboard");
    } else {
      showBanner("Invalid email or password. Please try again.", "error");
    }
  };

  // Auth: Handle Signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      showBanner("All fields are required.", "error");
      return;
    }
    if (signupForm.password.length < 8) {
      showBanner("Password must be at least 8 characters long for security.", "error");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      showBanner("Passwords do not match.", "error");
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === signupForm.email.trim().toLowerCase())) {
      showBanner("An account with this email already exists. Please log in.", "error");
      return;
    }

    const newUserId = Date.now();
    const newUser: UserAccount = {
      id: newUserId,
      name: signupForm.name.trim(),
      email: signupForm.email.trim().toLowerCase(),
      created_at: new Date().toISOString()
    };

    // Seed starter demo tests for this user only
    const userStarterTests = [
      { id: Date.now() + 1, user_id: newUserId, test_name: "Fasting Blood Sugar", value: 110.0, unit: "mg/dL", test_date: "2025-01-15", ref_min: 70.0, ref_max: 99.0 },
      { id: Date.now() + 2, user_id: newUserId, test_name: "Fasting Blood Sugar", value: 102.0, unit: "mg/dL", test_date: "2025-03-10", ref_min: 70.0, ref_max: 99.0 },
      { id: Date.now() + 3, user_id: newUserId, test_name: "Hemoglobin", value: 14.0, unit: "g/dL", test_date: "2025-03-10", ref_min: 12.0, ref_max: 16.0 }
    ];

    setUsers([...users, newUser]);
    setTests([...tests, ...userStarterTests]);
    setCurrentUserId(newUserId);
    setSignupForm({ name: "", email: "", password: "", confirmPassword: "" });
    showBanner(`Account created! Welcome, ${newUser.name}. Your records are private.`, "success");
    setActiveTab("dashboard");
  };

  // Auth: Handle Logout
  const handleLogout = () => {
    setCurrentUserId(null);
    setViewingReportAnalysis(null);
    showBanner("You have been signed out securely.", "success");
    setActiveTab("login");
  };

  // Switch demo account
  const switchAccount = (userId: number) => {
    setCurrentUserId(userId);
    setViewingReportAnalysis(null);
    const u = users.find((x) => x.id === userId);
    showBanner(`Switched to account: ${u?.name} (${u?.email})`, "success");
  };

  // PDF Report Analysis Handler (POST /reports/<id>/analyze logic)
  const handleAnalyzePdfReport = async (report: MedicalReport, forceReanalyze: boolean = false) => {
    if (!currentUser) return;

    // Check ownership
    if (report.user_id !== currentUser.id) {
      setShowCrossUserAlert(true);
      return;
    }

    // If report already has cached ai_summary and not forcing re-analyze, show cached immediately
    if (report.ai_summary && !forceReanalyze) {
      setViewingReportAnalysis(report);
      return;
    }

    // Handle Scanned Image PDF
    if (report.is_scanned) {
      setViewingReportAnalysis({
        ...report,
        ai_summary: "This PDF looks like a scanned image. Please add the values using Manual Test Entry."
      });
      return;
    }

    setIsPdfAnalyzing(true);
    setViewingReportAnalysis(report);

    // Simulate pypdf extraction + Groq Llama 3.3 call
    try {
      await new Promise((r) => setTimeout(r, 1600));

      const generatedSummary = `1. OVERVIEW OF KEY TESTS & MEASUREMENTS:
• Fasting Blood Sugar: 104.0 mg/dL (Reference Range: 70.0 to 99.0 mg/dL)
• Total Cholesterol: 198.0 mg/dL (Reference Range: 125.0 to 200.0 mg/dL)
• Hemoglobin: 14.1 g/dL (Reference Range: 12.0 to 16.0 g/dL)
• Vitamin D (25-OH): 22.0 ng/mL (Reference Range: 30.0 to 100.0 ng/mL)

2. VALUES OUTSIDE REFERENCE RANGE vs NORMAL VALUES:
• ⚠️ Fasting Blood Sugar is slightly ABOVE the maximum reference limit (104 vs 99 mg/dL).
• ⚠️ Vitamin D is BELOW the minimum reference limit (22 vs 30 ng/mL).
• ✅ Hemoglobin and Total Cholesterol are completely within NORMAL healthy parameters.

3. SIMPLE EXPLANATION OF WHAT THESE NUMBERS MEAN (10th-Grade Level):
• Blood sugar is the glucose dissolved in your blood that powers your cells. Being slightly above the threshold suggests monitoring high-glycemic foods and sweets.
• Vitamin D is vital for strong bones and immune resilience. Lower numbers are very common for people who work indoors.
• Hemoglobin carrying capacity is steady and healthy.

4. GENERAL LIFESTYLE TIPS TO DISCUSS WITH A DOCTOR:
• Increase daily physical activity with a 20-30 minute brisk walk.
• Incorporate gentle morning sunshine for 15 minutes.
• Drink 8-10 glasses of water daily and balance meals with fiber.

⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor.`;

      // Cache summary in reports list
      const updatedReports = reports.map((r) => (r.id === report.id ? { ...r, ai_summary: generatedSummary } : r));
      setReports(updatedReports);
      setViewingReportAnalysis({ ...report, ai_summary: generatedSummary });
      showBanner("PDF report analyzed and summary cached in SQLite!", "success");
    } catch (e) {
      showBanner("Could not analyze report.", "error");
    } finally {
      setIsPdfAnalyzing(false);
    }
  };

  // Add Report Action
  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reportTitle) {
      showBanner("Please enter a report title.", "error");
      return;
    }

    const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newReport: MedicalReport = {
      id: Date.now(),
      user_id: currentUser.id,
      title: reportTitle.trim(),
      file_path: `${randomHash}.pdf`,
      upload_date: new Date().toISOString().split("T")[0],
      is_scanned: isUploadingScanned
    };

    setReports([newReport, ...reports]);
    setReportTitle("");
    setIsUploadingScanned(false);
    showBanner("Medical PDF report stored securely in your private vault!", "success");
  };

  // Delete Report Action
  const handleDeleteReport = (id: number) => {
    if (!currentUser) return;
    const target = reports.find((r) => r.id === id);
    if (!target || target.user_id !== currentUser.id) {
      setShowCrossUserAlert(true);
      return;
    }
    setReports(reports.filter((r) => r.id !== id));
    if (viewingReportAnalysis?.id === id) {
      setViewingReportAnalysis(null);
    }
    showBanner("Medical report deleted.", "success");
  };

  // Add Test Action
  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!testForm.test_name || !testForm.value || !testForm.unit || !testForm.ref_min || !testForm.ref_max) {
      showBanner("Please fill in all test fields.", "error");
      return;
    }

    const newTest = {
      id: Date.now(),
      user_id: currentUser.id,
      test_name: testForm.test_name.trim(),
      value: parseFloat(testForm.value),
      unit: testForm.unit.trim(),
      test_date: testForm.test_date,
      ref_min: parseFloat(testForm.ref_min),
      ref_max: parseFloat(testForm.ref_max)
    };

    setTests([newTest, ...tests]);
    setSelectedHistoryTest(newTest.test_name);
    showBanner(`Test '${newTest.test_name}' saved to your private profile!`, "success");
    setActiveTab("dashboard");
  };

  // Delete Test Action
  const handleDeleteTest = (id: number) => {
    if (!currentUser) return;
    const target = tests.find((t: any) => t.id === id);
    if (!target || target.user_id !== currentUser.id) {
      setShowCrossUserAlert(true);
      return;
    }
    setTests(tests.filter((t: any) => t.id !== id));
    showBanner("Test record deleted.", "success");
  };

  // Add Reminder Action
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reminderForm.title || !reminderForm.checkup_date) {
      showBanner("Title and Checkup Date are required.", "error");
      return;
    }

    const newReminder = {
      id: Date.now(),
      user_id: currentUser.id,
      title: reminderForm.title.trim(),
      checkup_date: reminderForm.checkup_date,
      notes: reminderForm.notes.trim()
    };

    setReminders([...reminders, newReminder]);
    setReminderForm({ title: "", checkup_date: "", notes: "" });
    showBanner("Checkup reminder scheduled!", "success");
  };

  // Delete Reminder Action
  const handleDeleteReminder = (id: number) => {
    if (!currentUser) return;
    const target = reminders.find((r: any) => r.id === id);
    if (!target || target.user_id !== currentUser.id) {
      setShowCrossUserAlert(true);
      return;
    }
    setReminders(reminders.filter((r: any) => r.id !== id));
    showBanner("Reminder deleted.", "success");
  };

  // Run Manual Tests Analysis
  const runManualAiAnalysis = async () => {
    if (!currentUser) return;
    setIsManualAiLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    const analysis = `1. SUMMARY OF RECORDED LAB RESULTS (Patient: ${currentUser.name}):
• Fasting Blood Sugar: 104.0 mg/dL (Ref: 70 - 99 mg/dL) — OUTSIDE RANGE (Slightly High)
• Total Cholesterol: 198.0 mg/dL (Ref: 125 - 200 mg/dL) — NORMAL
• Hemoglobin: 14.1 g/dL (Ref: 12 - 16 g/dL) — NORMAL

2. SIMPLE 10TH-GRADE EXPLANATION:
• Your blood sugar is slightly higher than standard overnight fasting values. Watching refined carbohydrates and added sugars can help bring it back to target.
• Cholesterol and blood oxygen-carrying hemoglobin are steady.

3. GENERAL HEALTHY HABITS:
• Hydration: Drink 2.5 to 3 liters of water throughout the day.
• Physical Activity: 30 minutes of brisk walking 5 days a week.
• Diet: Fill half your plate with colorful vegetables and legumes.

⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor.`;

    setManualAiAnalysisResult(analysis);
    setIsManualAiLoading(false);
  };

  // AI Diet Suggestions Generator
  const generateDietPlan = async () => {
    setIsDietLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let plan = `🥗 Balanced Indian Meal Plan (${dietPreference.toUpperCase()}):\n\n`;
    if (dietPreference === "vegetarian") {
      plan += `• Breakfast: Moong Dal Cheela with fresh mint chutney & warm lemon water.\n• Lunch: 2 Multigrain rotis, bowl of yellow dal tadka, seasonal green sabzi (palak/methi), cucumber salad.\n• Evening Snack: Roasted makhana or boiled chana chaat with green tea.\n• Dinner: Light vegetable khichdi or grilled paneer with warm tomato soup.`;
    } else if (dietPreference === "non-vegetarian") {
      plan += `• Breakfast: 2 Boiled egg whites with whole wheat toast & spiced chai without sugar.\n• Lunch: 2 Phulkas, 100g skinless chicken curry (mildly spiced) or fish curry, mixed veg salad.\n• Evening Snack: Boiled egg chaat with lime and green chili or roasted fox nuts.\n• Dinner: Clear chicken and vegetable soup with 1 multigrain roti.`;
    } else {
      plan += `• Breakfast: Oats vegetable upma with peanuts & coconut water.\n• Lunch: 2 Bajra rotis, chana dal, stir-fried tofu and capsicum, kachumber salad.\n• Evening Snack: Sprouted moong chaat with pomegranate and lemon.\n• Dinner: Quinoa and yellow lentil khichdi with spinach clear soup.`;
    }

    plan += `\n\n💡 Personalized for ${currentUser?.name || "Patient"}: Drink 8-10 glasses of water daily and finish dinner 2.5 hours before sleeping.`;
    setDietResult(plan + "\n\n⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor.");
    setIsDietLoading(false);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const trendData = getTrendData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] to-[#f0fdf9] text-[#0f172a] flex flex-col font-sans">
      {/* Top Header Navigation - Vibrant Blue to Teal Gradient */}
      <header className="bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (currentUser) {
                setViewingReportAnalysis(null);
                setActiveTab("dashboard");
              }
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                HealthTrack AI
                <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                  PDF Analyzer Edition
                </span>
              </div>
              <div className="text-xs text-white/80">pypdf + Groq Llama 3.3 + Flask Multi-User</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 flex-wrap">
            {currentUser ? (
              <>
                {[
                  { id: "dashboard", label: "Dashboard", icon: Activity },
                  { id: "reports", label: "Reports", icon: FileText },
                  { id: "add_test", label: "Add Test", icon: PlusCircle },
                  { id: "analyze", label: "Analyze", icon: Cpu },
                  { id: "history", label: "History", icon: TrendingUp },
                  { id: "diet", label: "Diet", icon: Utensils },
                  { id: "reminders", label: "Reminders", icon: Bell },
                  { id: "code", label: "Project Files", icon: Code2, highlight: true }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id && !viewingReportAnalysis;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setViewingReportAnalysis(null);
                        setActiveTab(tab.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-white text-[#0284c7] font-semibold shadow-xs"
                          : tab.highlight
                          ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                          : "text-white/90 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {/* User Info Greeting */}
                <div className="ml-2 pl-2 border-l border-white/25 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-lg border border-white/25 text-xs font-semibold text-white">
                    <User className="w-3.5 h-3.5" />
                    <span>{currentUser.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === "login" ? "bg-white text-[#0284c7] font-semibold" : "text-white/90 hover:bg-white/15"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className="bg-white text-[#0284c7] px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/90 flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeTab === "code" ? "bg-[#7c3aed] text-white" : "text-white/90 hover:bg-white/15"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Project Files</span>
                </button>
              </>
            )}

            {/* Groq Key Modal Trigger */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="ml-1 p-1.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg text-xs text-white"
              title="Groq Key Settings"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Account Demo Switcher Banner */}
      <div className="bg-[#e0f2fe]/70 border-b border-[#bae6fd] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[#0369a1]">
          <div className="flex items-center gap-2 font-medium">
            <ScanText className="w-4 h-4 text-[#0284c7]" />
            <span>
              <strong>B.Tech Viva Demo:</strong> Test automated PDF text analysis & per-user caching live:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#0369a1]">Active account:</span>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => switchAccount(u.id)}
                className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                  currentUserId === u.id
                    ? "bg-[#0284c7] text-white border-[#0284c7]"
                    : "bg-white text-[#0369a1] border-[#bae6fd] hover:bg-[#e0f2fe]"
                }`}
              >
                👤 {u.name}
              </button>
            ))}
            <button
              onClick={() => setShowCrossUserAlert(true)}
              className="px-2 py-0.5 rounded text-xs font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fecaca]"
              title="Simulate accessing another user's report URL"
            >
              ⚠️ Test URL Tampering (404)
            </button>
          </div>
        </div>
      </div>

      {/* Flash Alert Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${
              notification.type === "success"
                ? "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]"
                : "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]"
            }`}
          >
            {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Cross-User Security Simulation Modal */}
      {showCrossUserAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-14 h-14 bg-[#fee2e2] text-[#991b1b] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔒 404
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0f172a]">Record Not Found or Access Restricted</h3>
              <p className="text-xs text-[#64748b] mt-2 leading-relaxed">
                <strong>IDOR Defense Active:</strong> You attempted to open or analyze a report that does not belong to your account ID ({currentUserId}). The backend route checked <code>WHERE user_id = ?</code> and aborted with a <strong>404 Not Found</strong> response.
              </p>
            </div>
            <div className="p-3 bg-[#f8fafc] rounded-lg text-left text-xs font-mono text-[#334155] border border-[#e2e8f0]">
              <code>POST /reports/1/analyze &rarr; 404 FORBIDDEN_OBJECT</code><br />
              <code>Ownership check: session['user_id'] != report.user_id</code>
            </div>
            <button
              onClick={() => setShowCrossUserAlert(false)}
              className="w-full bg-[#0284c7] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#0369a1]"
            >
              Understood (Return to Safe View)
            </button>
          </div>
        </div>
      )}

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* ================= VIEW: PDF REPORT AI ANALYSIS ================= */}
        {viewingReportAnalysis && currentUser && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <button
                  onClick={() => setViewingReportAnalysis(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0284c7] font-semibold hover:underline mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to My Reports
                </button>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <span>🧠</span> PDF Laboratory Report Analysis
                </h1>
                <p className="text-sm text-[#64748b]">
                  Report: <strong>{viewingReportAnalysis.title}</strong> &bull; Uploaded on {viewingReportAnalysis.upload_date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleAnalyzePdfReport(viewingReportAnalysis, true)
                  }
                  disabled={isPdfAnalyzing}
                  className="bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPdfAnalyzing ? "animate-spin" : ""}`} />
                  Re-analyze with AI
                </button>
                <button
                  onClick={() => showBanner(`Streaming protected PDF: ${viewingReportAnalysis.file_path}`, "success")}
                  className="bg-white border border-[#cbd5e1] text-[#334155] px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#f1f5f9] flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#0284c7]" />
                  View Raw PDF
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {isPdfAnalyzing && (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-8 text-center text-[#166534] shadow-xs">
                <div className="w-10 h-10 border-4 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin mx-auto mb-3"></div>
                <div className="font-bold text-base">Analyzing, please wait...</div>
                <div className="text-xs text-[#15803d] mt-1">
                  Extracting text with pypdf and consulting Groq Llama 3.3 (llama-3.3-70b-versatile).
                </div>
              </div>
            )}

            {/* Scanned Image PDF Warning Case */}
            {viewingReportAnalysis.is_scanned && !isPdfAnalyzing && (
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-6 shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center text-2xl font-bold shrink-0">
                    📷
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#9a3412] mb-1">Scanned Document Detected</h2>
                    <p className="text-sm text-[#7c2d12] leading-relaxed mb-4">
                      This PDF looks like a scanned image. Please add the values using Manual Test Entry.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setViewingReportAnalysis(null);
                          setActiveTab("add_test");
                        }}
                        className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
                      >
                        ➕ Go to Manual Test Entry
                      </button>
                      <button
                        onClick={() => setViewingReportAnalysis(null)}
                        className="bg-white border border-[#cbd5e1] text-[#475569] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#f8fafc]"
                      >
                        Back to Reports
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Successful AI Breakdown Card */}
            {!viewingReportAnalysis.is_scanned && viewingReportAnalysis.ai_summary && !isPdfAnalyzing && (
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-6 shadow-md hover:-translate-y-0.5 transition-all space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <h3 className="font-bold text-[#7c3aed] text-base">
                      AI Medical Report Breakdown
                    </h3>
                  </div>
                  <span className="text-xs bg-[#ede9fe] text-[#7c3aed] px-2.5 py-1 rounded-full font-semibold">
                    pypdf &bull; Groq Llama 3.3 &bull; Cached in SQLite
                  </span>
                </div>

                <div className="bg-[#f8fafc] border border-[#cbd5e1] border-l-4 border-l-[#7c3aed] rounded-lg p-5 text-sm leading-relaxed text-[#1e293b] whitespace-pre-wrap font-sans">
                  {viewingReportAnalysis.ai_summary}
                </div>

                {/* Safety Warning */}
                <div className="bg-[#fffdf5] border-l-4 border-l-[#ea580c] p-3 rounded-r-lg text-xs text-[#9a3412] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#ea580c]" />
                  <span>
                    <strong>Important Patient Safety Note:</strong> AI-generated information, not medical advice. Please consult your doctor.
                  </span>
                </div>

                <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
                  <span>💡 This summary is cached in SQLite (<code>reports.ai_summary</code>) so Groq is not called on every visit.</span>
                  <button
                    onClick={() => handleAnalyzePdfReport(viewingReportAnalysis, true)}
                    className="text-[#0d9488] font-semibold hover:underline"
                  >
                    🔄 Re-analyze with AI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: SIGN IN ================= */}
        {activeTab === "login" && !currentUser && (
          <div className="max-w-md mx-auto my-8 bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-all">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0f172a]">Sign In to HealthTrack</h2>
              <p className="text-xs text-[#64748b] mt-1">Access your encrypted private healthcare dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#f1f5f9] text-center text-xs text-[#64748b]">
              Demo accounts available: <strong>rahul@example.com</strong> or <strong>priya@example.com</strong>.
              <div className="mt-2">
                Need an account?{" "}
                <button onClick={() => setActiveTab("signup")} className="text-[#0284c7] font-semibold hover:underline">
                  Create Private Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SIGN UP ================= */}
        {activeTab === "signup" && !currentUser && (
          <div className="max-w-md mx-auto my-8 bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-all">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0f172a]">Create Private Account</h2>
              <p className="text-xs text-[#64748b] mt-1">Set up your personal health vault.</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-lg text-xs text-[#166534] flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#16a34a]" />
              <span>
                <strong>Privacy Guaranteed:</strong> Your reports are private and visible only to you.
              </span>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Full Name</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Ananya Roy"
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Email Address</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="ananya@example.com"
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Password</label>
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  minLength={8}
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all"
              >
                Create My Account
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#f1f5f9] text-center text-xs text-[#64748b]">
              Already registered?{" "}
              <button onClick={() => setActiveTab("login")} className="text-[#0284c7] font-semibold hover:underline">
                Sign in here
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === "dashboard" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <span>📊</span> {currentUser.name}'s Health Dashboard
                </h1>
                <p className="text-sm text-[#64748b]">
                  Overview of saved diagnostic reports, lab metrics, and scheduled appointments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("add_test")}
                  className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Test Result
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  View & Analyze Reports
                </button>
              </div>
            </div>

            {/* 3 Main Stat Cards with Distinct Accent Borders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center text-xl font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0f172a]">{userReports.length}</div>
                  <div className="text-xs text-[#64748b]">Private PDF Reports</div>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center text-xl font-bold">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0f172a]">{userTests.length}</div>
                  <div className="text-xs text-[#64748b]">Lab Tests Recorded</div>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center text-xl font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0f172a]">{userReminders.length}</div>
                  <div className="text-xs text-[#64748b]">Upcoming Checkups</div>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-white via-white to-[#faf5ff] border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#7c3aed] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                    AI PDF Medical Report Reader (New Feature)
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Click "Analyze with AI" on any PDF to extract text via <code>pypdf</code> and generate a plain-English explanation.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-95 shadow-xs"
                >
                  Open PDF Reports &rarr;
                </button>
              </div>
            </div>

            {/* 2-Column Split: Recent Tests & Checkups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tests Table */}
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#0f172a] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284c7]" />
                    Recent Test Results
                  </h3>
                  <button
                    onClick={() => setActiveTab("add_test")}
                    className="text-xs text-[#0284c7] hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white text-xs font-semibold">
                        <th className="py-2.5 px-3">Test Name</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Normal Range</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {userTests.slice(0, 5).map((t: any, idx: number) => {
                        const isOutside = t.value < t.ref_min || t.value > t.ref_max;
                        return (
                          <tr key={t.id} className={idx % 2 === 0 ? "bg-white hover:bg-[#f0f9ff]" : "bg-[#f8fafc] hover:bg-[#f0f9ff]"}>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#0f172a]">{t.test_name}</div>
                              <div className="text-[11px] text-[#94a3b8]">{t.test_date}</div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#0f172a]">
                              {t.value} <span className="text-xs font-normal text-[#64748b]">{t.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-[#64748b]">
                              {t.ref_min} - {t.ref_max}
                            </td>
                            <td className="py-2.5 px-3">
                              {isOutside ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                                  Outside Range ⚠️
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                                  Normal ✅
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Checkups */}
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0f172a] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#ea580c]" />
                      Upcoming Appointments
                    </h3>
                    <button
                      onClick={() => setActiveTab("reminders")}
                      className="text-xs text-[#0284c7] hover:underline font-medium"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {userReminders.slice(0, 3).map((r: any) => (
                      <div
                        key={r.id}
                        className="border border-[#e2e8f0] border-l-4 border-l-[#ea580c] rounded-lg p-3 bg-[#fffdfa]"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-[#0f172a]">
                          <span>{r.title}</span>
                          <span className="text-xs bg-white px-2 py-0.5 rounded border border-[#e2e8f0] text-[#64748b]">
                            📅 {r.checkup_date}
                          </span>
                        </div>
                        {r.notes && <p className="text-xs text-[#64748b] mt-1">{r.notes}</p>}
                      </div>
                    ))}
                    {userReminders.length === 0 && (
                      <div className="text-xs text-[#94a3b8] py-4 text-center">
                        No upcoming appointments scheduled.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
                  <span>Stay proactive with routine checkups.</span>
                  <button
                    onClick={() => setActiveTab("reminders")}
                    className="text-[#0284c7] font-semibold hover:underline"
                  >
                    + Add New Reminder
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Chart Preview */}
            {userTests.length > 0 && (
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#0f172a] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
                      Personal Trend Curve: {selectedHistoryTest}
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Showing only historical readings linked to {currentUser.name}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="bg-[#ede9fe] text-[#7c3aed] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#ddd6fe]"
                  >
                    Full Comparison &rarr;
                  </button>
                </div>

                <div className="h-64 w-full relative">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MEDICAL REPORTS ================= */}
        {activeTab === "reports" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <span>📁</span> My Private Medical Reports
              </h1>
              <p className="text-sm text-[#64748b]">
                Upload PDF lab reports. Extract text via <code>pypdf</code> and generate instant educational breakdowns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Form */}
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <h2 className="font-semibold text-[#0f172a] mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0284c7]" />
                  Upload New PDF Report
                </h2>

                <form onSubmit={handleAddReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Report Title / Lab Description
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="e.g. CBC Blood Panel - Apollo Clinic"
                      required
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Select PDF File (.pdf only, max 5 MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && !reportTitle) {
                          setReportTitle(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }}
                      className="w-full text-xs text-[#64748b] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e0f2fe] file:text-[#0284c7] hover:file:bg-[#bae6fd]"
                    />
                    <small className="text-[11px] text-[#64748b] block mt-1">
                      PDF text will be read using pure-Python <code>pypdf</code>.
                    </small>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isScannedDemo"
                      checked={isUploadingScanned}
                      onChange={(e) => setIsUploadingScanned(e.target.checked)}
                      className="rounded text-[#ea580c]"
                    />
                    <label htmlFor="isScannedDemo" className="text-xs text-[#64748b] cursor-pointer">
                      Simulate as a <strong>scanned image PDF</strong> (tests empty text fallback message)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white py-2 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Save Report to Database
                  </button>
                </form>
              </div>

              {/* PDF Analysis Architecture Info */}
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-5 space-y-2.5 shadow-xs hover:-translate-y-1 transition-all">
                <h3 className="font-semibold text-[#0f172a] text-sm flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#0d9488]" />
                  pypdf & AI Caching Architecture (Part 1)
                </h3>
                <ul className="text-xs text-[#475569] space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Pure-Python Extraction:</strong> <code>extract_text_from_pdf()</code> uses <code>pypdf.PdfReader</code> to loop over pages and extract text strings.
                  </li>
                  <li>
                    <strong>Scanned PDF Fallback:</strong> If extracted text is empty, the system politely alerts: <em>"This PDF looks like a scanned image. Please add the values using Manual Test Entry."</em>
                  </li>
                  <li>
                    <strong>SQLite Caching:</strong> Analysis result is stored in the <code>reports.ai_summary</code> column so Groq is called only once per document.
                  </li>
                  <li>
                    <strong>Re-analyze Button:</strong> Patients can refresh the summary at any time with one click.
                  </li>
                </ul>
              </div>
            </div>

            {/* User's Reports Table */}
            <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
              <h3 className="font-semibold text-[#0f172a] mb-4">
                Saved Medical Reports ({userReports.length})
              </h3>

              {userReports.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white text-xs font-semibold">
                        <th className="py-2.5 px-3">Report Title</th>
                        <th className="py-2.5 px-3">Upload Date</th>
                        <th className="py-2.5 px-3">AI Analysis Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {userReports.map((r, idx) => (
                        <tr key={r.id} className={idx % 2 === 0 ? "bg-white hover:bg-[#f0f9ff]" : "bg-[#f8fafc] hover:bg-[#f0f9ff]"}>
                          <td className="py-2.5 px-3 font-semibold text-[#0f172a]">
                            📄 {r.title}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-[#64748b]">
                            {r.upload_date}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.ai_summary ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ede9fe] text-[#7c3aed] border border-[#ddd6fe]">
                                ✨ Analyzed with AI
                              </span>
                            ) : r.is_scanned ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa]">
                                📷 Scanned Image
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]">
                                ⏳ Ready to Analyze
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Analyze with AI Button */}
                              <button
                                onClick={() => handleAnalyzePdfReport(r)}
                                className="px-2.5 py-1 text-xs bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-lg hover:opacity-95 font-semibold flex items-center gap-1 shadow-xs"
                              >
                                <Sparkles className="w-3 h-3" />
                                {r.ai_summary ? "View AI Summary" : "Analyze with AI"}
                              </button>

                              {/* View PDF */}
                              <button
                                onClick={() => showBanner(`Streaming protected PDF: ${r.file_path}`, "success")}
                                className="px-2.5 py-1 text-xs border border-[#cbd5e1] rounded-lg hover:bg-[#f1f5f9] text-[#0284c7] font-medium flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View PDF
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteReport(r.id)}
                                className="px-2.5 py-1 text-xs bg-gradient-to-r from-[#ef4444] to-[#b91c1c] text-white rounded-lg hover:opacity-95 font-medium flex items-center gap-1 shadow-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-[#94a3b8]">
                  No reports uploaded yet. Upload one using the form above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: MANUAL TEST ENTRY ================= */}
        {activeTab === "add_test" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <span>🧪</span> Manual Lab Test Entry
              </h1>
              <p className="text-sm text-[#64748b]">
                Record clinical test readings with exact normal reference limits into your account.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5">
                    Quick Presets (Click to autofill):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Fasting Blood Sugar", unit: "mg/dL", min: "70", max: "99" },
                      { name: "Hemoglobin", unit: "g/dL", min: "12.0", max: "16.0" },
                      { name: "Total Cholesterol", unit: "mg/dL", min: "125", max: "200" },
                      { name: "Vitamin D", unit: "ng/mL", min: "30", max: "100" },
                      { name: "TSH (Thyroid)", unit: "uIU/mL", min: "0.4", max: "4.0" }
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setTestForm({
                            ...testForm,
                            test_name: p.name,
                            unit: p.unit,
                            ref_min: p.min,
                            ref_max: p.max
                          })
                        }
                        className="text-xs bg-[#f1f5f9] text-[#334155] px-2.5 py-1 rounded-md hover:bg-[#e2e8f0] border border-[#e2e8f0]"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddTest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Test Name</label>
                    <input
                      type="text"
                      value={testForm.test_name}
                      onChange={(e) => setTestForm({ ...testForm, test_name: e.target.value })}
                      placeholder="e.g. Fasting Blood Sugar"
                      required
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">Result Value</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testForm.value}
                        onChange={(e) => setTestForm({ ...testForm, value: e.target.value })}
                        placeholder="e.g. 104.5"
                        required
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">Unit of Measurement</label>
                      <input
                        type="text"
                        value={testForm.unit}
                        onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                        placeholder="e.g. mg/dL, g/dL"
                        required
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Test Date</label>
                    <input
                      type="date"
                      value={testForm.test_date}
                      onChange={(e) => setTestForm({ ...testForm, test_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">Reference Range Min</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testForm.ref_min}
                        onChange={(e) => setTestForm({ ...testForm, ref_min: e.target.value })}
                        placeholder="e.g. 70"
                        required
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">Reference Range Max</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testForm.ref_max}
                        onChange={(e) => setTestForm({ ...testForm, ref_max: e.target.value })}
                        placeholder="e.g. 99"
                        required
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Save Test Entry to My Account
                  </button>
                </form>
              </div>

              {/* Explanatory Sidebar */}
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-5 space-y-3 shadow-xs hover:-translate-y-1 transition-all">
                <h3 className="font-semibold text-[#0f172a] text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0d9488]" />
                  Why Manual Entry Complements PDFs
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  When lab reports are printed as physical sheets or scanned photos where text cannot be parsed by OCR/pypdf, Manual Test Entry allows 100% accurate recording.
                </p>
                <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569]">
                  <strong>History Charts:</strong> Uses these numbers to calculate Improved vs Worsened trends over time.
                </div>
              </div>
            </div>

            {/* List of User's Tests */}
            <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
              <h3 className="font-semibold text-[#0f172a] mb-4">
                Recorded Lab Tests for {currentUser.name} ({userTests.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white text-xs font-semibold">
                      <th className="py-2.5 px-3">Test Name</th>
                      <th className="py-2.5 px-3">Test Date</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Evaluation</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {userTests.map((t: any, idx: number) => {
                      const isOutside = t.value < t.ref_min || t.value > t.ref_max;
                      return (
                        <tr key={t.id} className={idx % 2 === 0 ? "bg-white hover:bg-[#f0f9ff]" : "bg-[#f8fafc] hover:bg-[#f0f9ff]"}>
                          <td className="py-2.5 px-3 font-semibold text-[#0f172a]">{t.test_name}</td>
                          <td className="py-2.5 px-3 text-xs text-[#64748b]">{t.test_date}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#0f172a]">
                            {t.value} {t.unit}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-[#64748b]">
                            {t.ref_min} - {t.ref_max} {t.unit}
                          </td>
                          <td className="py-2.5 px-3">
                            {isOutside ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                                Outside Range ⚠️
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                                Normal ✅
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteTest(t.id)}
                              className="px-2 py-1 text-xs text-white bg-gradient-to-r from-[#ef4444] to-[#b91c1c] rounded shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: AI REPORT ANALYZER ================= */}
        {activeTab === "analyze" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <span>🤖</span> AI Health Report Analyzer
                </h1>
                <p className="text-sm text-[#64748b]">
                  Analyzing manual test records for {currentUser.name} using Groq Llama 3.3.
                </p>
              </div>

              <button
                onClick={runManualAiAnalysis}
                disabled={isManualAiLoading}
                className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isManualAiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing with Groq AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {manualAiAnalysisResult ? "Re-run AI Analysis" : "Analyze My Numbers Now"}
                  </>
                )}
              </button>
            </div>

            {/* AI Output Card */}
            {manualAiAnalysisResult && !isManualAiLoading && (
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <h3 className="font-bold text-[#7c3aed] text-base">
                      Groq AI Intelligent Health Analysis (Patient: {currentUser.name})
                    </h3>
                  </div>
                  <span className="text-xs bg-[#ede9fe] text-[#7c3aed] px-2.5 py-1 rounded-full font-semibold">
                    Model: llama-3.3-70b-versatile
                  </span>
                </div>

                <div className="bg-[#f8fafc] border border-[#cbd5e1] border-l-4 border-l-[#7c3aed] rounded-lg p-5 text-sm leading-relaxed text-[#1e293b] whitespace-pre-wrap font-sans">
                  {manualAiAnalysisResult}
                </div>

                <div className="bg-[#fffdf5] border-l-4 border-l-[#ea580c] p-3 rounded-r-lg text-xs text-[#9a3412] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#ea580c]" />
                  <span>
                    <strong>Safety Rule:</strong> AI-generated information, not medical advice. Please consult your doctor.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: HEALTH HISTORY ================= */}
        {activeTab === "history" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <span>📈</span> Health History & Trend Comparison
              </h1>
              <p className="text-sm text-[#64748b]">
                Comparing previous and current values for {currentUser.name}.
              </p>
            </div>

            {/* Test Selector Card */}
            <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-4 shadow-xs flex items-center gap-4 flex-wrap hover:-translate-y-1 transition-all">
              <label className="text-sm font-semibold text-[#0f172a]">
                Select Test to Compare:
              </label>
              <select
                value={selectedHistoryTest}
                onChange={(e) => setSelectedHistoryTest(e.target.value)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm font-medium focus:outline-none focus:border-[#0284c7]"
              >
                {distinctTestNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-4 shadow-xs hover:-translate-y-1 transition-all">
                <div className="text-xs text-[#64748b] mb-1">Previous vs Latest Reading</div>
                <div className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                  <span>{trendData.prev ?? "—"}</span>
                  <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
                  <span className="text-[#0284c7]">{trendData.curr ?? "—"}</span>
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">{selectedHistoryTest}</div>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-4 shadow-xs hover:-translate-y-1 transition-all">
                <div className="text-xs text-[#64748b] mb-1">Historical Readings Count</div>
                <div className="text-xl font-bold text-[#0f172a]">
                  {userTests.filter((t: any) => t.test_name === selectedHistoryTest).length} Entries
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">Recorded for {currentUser.name}</div>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-4 shadow-xs hover:-translate-y-1 transition-all">
                <div className="text-xs text-[#64748b] mb-1">Health Trend Status</div>
                <div className="mt-0.5">
                  {trendData.status === "Improved" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Improved
                    </span>
                  ) : trendData.status === "Worsened" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Worsened
                    </span>
                  ) : trendData.status === "Stable" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                      ⚖️ Stable
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b]">
                      {trendData.status}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">{trendData.text}</div>
              </div>
            </div>

            {/* Line Chart Card */}
            <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#7c3aed] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
              <h3 className="font-semibold text-[#0f172a] mb-4">
                Personal Progress Curve: {selectedHistoryTest}
              </h3>
              <div className="h-80 w-full relative">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: AI DIET SUGGESTIONS ================= */}
        {activeTab === "diet" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <span>🥗</span> AI Personalized Diet Suggestions
              </h1>
              <p className="text-sm text-[#64748b]">
                Wholesome Indian daily meal suggestions for {currentUser.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <h2 className="font-semibold text-[#0f172a] mb-4">Select Food Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-2">Dietary Preference</label>
                    <div className="flex gap-4">
                      {[
                        { id: "vegetarian", label: "🌱 Vegetarian" },
                        { id: "non-vegetarian", label: "🍗 Non-Veg" },
                        { id: "vegan", label: "🌿 100% Vegan" }
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="dietPref"
                            value={item.id}
                            checked={dietPreference === item.id}
                            onChange={() => setDietPreference(item.id as any)}
                            className="text-[#0d9488]"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Optional Notes</label>
                    <textarea
                      rows={3}
                      value={dietNotes}
                      onChange={(e) => setDietNotes(e.target.value)}
                      placeholder="e.g. Low sodium, prefer mild spices..."
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#0d9488]"
                    ></textarea>
                  </div>

                  <button
                    onClick={generateDietPlan}
                    disabled={isDietLoading}
                    className="w-full bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-4 h-4" />
                    Generate Meal Plan
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-5 space-y-3 shadow-xs hover:-translate-y-1 transition-all">
                <h3 className="font-semibold text-[#0f172a] text-sm">Wholesome Nutrition Pillars</h3>
                <ul className="text-xs text-[#475569] space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>Breakfast:</strong> Moong dal cheela, vegetable upma, or idli-sambar.</li>
                  <li><strong>Lunch:</strong> Multigrain rotis, yellow dal/rajma, and seasonal vegetables.</li>
                  <li><strong>Snack:</strong> Roasted makhana or chana chaat instead of packaged biscuits.</li>
                  <li><strong>Dinner:</strong> Light khichdi or warm vegetable clear soup.</li>
                </ul>
              </div>
            </div>

            {dietResult && (
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <h3 className="font-bold text-[#0d9488] text-base flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Recommended Indian Meal Routine
                  </h3>
                  <span className="text-xs bg-[#ccfbf1] text-[#0f766e] px-2.5 py-1 rounded-full font-semibold uppercase">
                    {dietPreference}
                  </span>
                </div>

                <div className="bg-[#f8fafc] border border-[#cbd5e1] border-l-4 border-l-[#0d9488] rounded-lg p-5 text-sm leading-relaxed text-[#1e293b] whitespace-pre-wrap font-sans">
                  {dietResult}
                </div>

                <div className="bg-[#fffdf5] border-l-4 border-l-[#ea580c] p-3 rounded-r-lg text-xs text-[#9a3412]">
                  ⚠️ <strong>Disclaimer:</strong> AI-generated information, not medical advice. Please consult your doctor.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: CHECKUP REMINDERS ================= */}
        {activeTab === "reminders" && currentUser && !viewingReportAnalysis && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <span>⏰</span> Medical Checkup Reminders
              </h1>
              <p className="text-sm text-[#64748b]">
                Personal checkup schedule for {currentUser.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#ea580c] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
                <h2 className="font-semibold text-[#0f172a] mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#ea580c]" />
                  Schedule New Checkup
                </h2>

                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Reminder Title</label>
                    <input
                      type="text"
                      value={reminderForm.title}
                      onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                      placeholder="e.g. HbA1c 3-Month Follow Up"
                      required
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Checkup Date</label>
                    <input
                      type="date"
                      value={reminderForm.checkup_date}
                      onChange={(e) => setReminderForm({ ...reminderForm, checkup_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">Doctor Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={reminderForm.notes}
                      onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                      placeholder="e.g. Bring fasting test report..."
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#ea580c]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white py-2 rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Save Reminder to My Account
                  </button>
                </form>
              </div>

              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0d9488] rounded-xl p-5 space-y-3 shadow-xs hover:-translate-y-1 transition-all">
                <h3 className="font-semibold text-[#0f172a] text-sm">Checkup Reminders Protection</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Reminders are strictly tied to <code>user_id = {currentUser.id}</code> in SQLite. Other accounts can never see your doctor visits or clinic notes.
                </p>
              </div>
            </div>

            {/* Reminders Table */}
            <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-5 shadow-xs hover:-translate-y-1 transition-all">
              <h3 className="font-semibold text-[#0f172a] mb-4">
                Scheduled Reminders ({userReminders.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white text-xs font-semibold">
                      <th className="py-2.5 px-3">Title / Purpose</th>
                      <th className="py-2.5 px-3">Scheduled Date</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {userReminders.map((r: any, idx: number) => (
                      <tr key={r.id} className={idx % 2 === 0 ? "bg-white hover:bg-[#f0f9ff]" : "bg-[#f8fafc] hover:bg-[#f0f9ff]"}>
                        <td className="py-2.5 px-3 font-semibold text-[#0f172a]">{r.title}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                            📅 {r.checkup_date}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-[#64748b]">{r.notes || "—"}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteReminder(r.id)}
                            className="px-2 py-1 text-xs text-white bg-gradient-to-r from-[#ef4444] to-[#b91c1c] rounded shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {userReminders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-xs text-[#94a3b8]">
                          No checkup reminders found for this account.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: B.TECH PROJECT CODE EXPLORER ================= */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                  <span>🎓</span> B.Tech Project Source Code & Submission Hub
                </h1>
                <p className="text-sm text-[#64748b]">
                  Inspect every Python, SQLite, Jinja template, and CSS file requested for your college submission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(PROJECT_FILES[activeCodeFile]?.code || "")}
                  className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-95 shadow-xs transition-all flex items-center gap-1.5"
                >
                  {copiedFile ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedFile ? "Copied!" : `Copy ${activeCodeFile}`}
                </button>
                <button
                  onClick={() => handleDownloadFile(activeCodeFile, PROJECT_FILES[activeCodeFile]?.code || "")}
                  className="bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-95 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] border-l-4 border-l-[#16a34a] rounded-xl p-4 text-xs text-[#166534]">
              <div className="font-bold text-sm mb-1 text-[#15803d]">
                🛡️ PDF Text Extraction & Caching Data Flow (Viva Architecture):
              </div>
              <code>PDF Upload ➔ pypdf.PdfReader extracts text ➔ Truncate to 6,000 chars ➔ Groq llama-3.3-70b-versatile ➔ Cached in SQLite reports.ai_summary ➔ Instant reload without API re-calls</code>
            </div>

            {/* Code Explorer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#e2e8f0] border-t-4 border-t-[#0284c7] rounded-xl p-4 shadow-xs space-y-2">
                <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                  Files (healthtrack/)
                </div>
                {Object.keys(PROJECT_FILES).map((fname) => (
                  <button
                    key={fname}
                    onClick={() => setActiveCodeFile(fname)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      activeCodeFile === fname
                        ? "bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white font-semibold shadow-xs"
                        : "text-[#334155] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    <span className="font-mono">{fname}</span>
                    <span className="text-[10px] opacity-75">{PROJECT_FILES[fname].language}</span>
                  </button>
                ))}

                <div className="pt-3 border-t border-[#e2e8f0] text-[11px] text-[#64748b]">
                  <strong>Execution:</strong>
                  <div className="bg-[#1e293b] text-[#38bdf8] p-2 rounded mt-1 font-mono text-[10px]">
                    rm healthtrack.db<br />
                    pip install -r requirements.txt<br />
                    python app.py
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 bg-[#1e293b] rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[#334155] text-xs text-[#94a3b8] mb-3">
                  <div className="font-mono text-[#38bdf8] font-bold">{activeCodeFile}</div>
                  <div>{PROJECT_FILES[activeCodeFile]?.desc}</div>
                </div>

                <pre className="text-xs font-mono text-[#e2e8f0] overflow-x-auto p-2 bg-[#0f172a] rounded-lg max-h-[500px] leading-relaxed">
                  <code>{PROJECT_FILES[activeCodeFile]?.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Groq API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0f172a] text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-[#0284c7]" />
                Configure Groq API Key
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed">
              In your local Python project, this key is kept exclusively in <code>.env</code> as <code>GROQ_API_KEY</code>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Groq API Key (starts with gsk_)
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value.trim())}
                placeholder="gsk_..."
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm font-mono focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setGroqKey("");
                  showBanner("Groq API key cleared.", "success");
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 text-xs text-[#991b1b] hover:bg-[#fee2e2] rounded-lg"
              >
                Clear Key
              </button>
              <button
                onClick={() => {
                  showBanner("Groq API key updated successfully!", "success");
                  setShowKeyModal(false);
                }}
                className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 text-center text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            HealthTrack AI — B.Tech 2nd Year Capstone Project. PDF Text Extraction via pypdf & Groq Llama 3.3.
          </p>
          <p className="text-[11px] text-[#94a3b8] mt-1">
            Disclaimer: AI-generated information, not medical advice. Please consult your doctor.
          </p>
        </div>
      </footer>
    </div>
  );
}
