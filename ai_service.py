import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Mandatory educational disclaimer under every AI output
DISCLAIMER_TEXT = "\n\n⚠️ Disclaimer: AI-generated information, not medical advice. Please consult your doctor."


# This helper function safely initializes the Groq client from environment variables
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key.strip() == "" or "your_key_here" in api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key.strip())
    except Exception as e:
        # Log error to server terminal only - never expose tracebacks to users
        print(f"[HealthTrack Server Error] Groq client initialization failed: {e}", file=sys.stderr)
        return None


# This function extracts text from a PDF report using pypdf and returns the joined text
def extract_text_from_pdf(file_path):
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        extracted_pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_pages.append(text)
        full_text = "\n".join(extracted_pages).strip()
        # If the text is empty or purely whitespace, return None
        if not full_text:
            return None
        return full_text
    except Exception as e:
        print(f"[HealthTrack Server Error] PDF text extraction failed: {e}", file=sys.stderr)
        return None


# This function sends up to 6000 characters of extracted PDF text to Groq Llama 3.3 for simple explanation
def analyze_report_text(text):
    if not text or not text.strip():
        return "No text available to analyze." + DISCLAIMER_TEXT

    client = get_groq_client()
    if not client:
        return (
            "ℹ️ Groq API key is not configured in .env.\n\n"
            "Extracted Medical Report Preview:\n"
            + text[:500]
            + ("..." if len(text) > 500 else "")
            + "\n\nPlease add your GROQ_API_KEY in the .env file to enable full Llama 3.3 AI analysis."
            + DISCLAIMER_TEXT
        )

    # Send only the first 6000 characters to prevent excessive tokens
    truncated_text = text[:6000]

    system_prompt = (
        "You are HealthTrack AI, an educational healthcare analyzer for students and families.\n"
        "STRICT RULES:\n"
        "1. Explain laboratory report findings in simple, encouraging language understandable by a 10th-grade student.\n"
        "2. Identify key test names, values, units, and reference ranges found in the report text.\n"
        "3. Clearly list which values appear NORMAL and which values appear OUTSIDE the normal reference range.\n"
        "4. Provide general lifestyle and wellness tips (hydration, balanced diet, sleep, exercise) to discuss with a doctor.\n"
        "5. DO NOT diagnose diseases or prescribe medications.\n"
        "6. Always advise consulting a qualified doctor or healthcare professional."
    )

    user_prompt = (
        f"Please analyze this extracted medical lab report text:\n\n"
        f"{truncated_text}\n\n"
        f"Format your response with clean bullet points and clear sections:\n"
        f"1. Overview of Key Tests & Measurements\n"
        f"2. Values Outside Reference Range vs Normal Values\n"
        f"3. Simple Explanation of What These Numbers Mean\n"
        f"4. General Lifestyle Tips to Discuss with a Doctor"
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=800
        )
        ai_response = chat_completion.choices[0].message.content
        return ai_response + DISCLAIMER_TEXT
    except Exception as e:
        print(f"[HealthTrack Server Error] Groq PDF Report Analysis failed: {e}", file=sys.stderr)
        return "The AI analyzer service is temporarily unavailable. Please try again later." + DISCLAIMER_TEXT


# This function analyzes the user's manual lab test values using Groq Llama 3.3 in simple 10th-grade English
def analyze_health_reports(tests_list):
    if not tests_list or len(tests_list) == 0:
        return "No test records found to analyze. Please add some lab test entries first!"

    client = get_groq_client()
    if not client:
        # User-friendly explanation without leaking API keys, paths, or internals
        analysis = (
            "ℹ️ AI Service Notice: Groq API key is not configured yet.\n\n"
            "Summary of your recorded test readings:\n"
        )
        for t in tests_list:
            is_low = t["value"] < t["ref_min"]
            is_high = t["value"] > t["ref_max"]
            status = "NORMAL ✅"
            if is_low:
                status = f"LOW ⚠️ (Min normal: {t['ref_min']} {t['unit']})"
            elif is_high:
                status = f"HIGH ⚠️ (Max normal: {t['ref_max']} {t['unit']})"
            analysis += f"• {t['test_name']}: {t['value']} {t['unit']} — {status}\n"

        analysis += "\n(Add your GROQ_API_KEY in the .env file to enable full Llama 3.3 narrative explanations.)"
        return analysis + DISCLAIMER_TEXT

    # Format user-specific test data into a clean prompt
    tests_summary = ""
    for t in tests_list:
        status_flag = "Normal"
        if t["value"] < t["ref_min"]:
            status_flag = f"OUT OF RANGE (Below min of {t['ref_min']})"
        elif t["value"] > t["ref_max"]:
            status_flag = f"OUT OF RANGE (Above max of {t['ref_max']})"
        tests_summary += f"- {t['test_name']}: {t['value']} {t['unit']} (Standard Normal Range: {t['ref_min']} to {t['ref_max']} {t['unit']}) -> Status: {status_flag}\n"

    system_prompt = (
        "You are HealthTrack AI, an educational healthcare analyzer for students and families.\n"
        "STRICT RULES:\n"
        "1. Explain laboratory results in simple, encouraging language understandable by a 10th-grade student.\n"
        "2. Clearly identify and list which values are NORMAL and which values are OUTSIDE the reference range.\n"
        "3. Provide general educational insights on what each test measures and healthy lifestyle habits (hydration, balanced diet, sleep, exercise).\n"
        "4. DO NOT diagnose any diseases or conditions.\n"
        "5. DO NOT prescribe medications, dosages, or medical treatments.\n"
        "6. Always advise consulting a qualified doctor or healthcare professional."
    )

    user_prompt = (
        f"Please analyze these recent laboratory test records:\n\n"
        f"{tests_summary}\n\n"
        f"Format your response with clean bullet points and clear sections:\n"
        f"1. Overview of Out-of-Range vs Normal Values\n"
        f"2. Simple Explanation of What These Numbers Mean\n"
        f"3. General Healthy Habits to Discuss with a Physician"
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=800
        )
        ai_response = chat_completion.choices[0].message.content
        return ai_response + DISCLAIMER_TEXT
    except Exception as e:
        print(f"[HealthTrack Server Error] Groq API call failed: {e}", file=sys.stderr)
        return "The AI analyzer service is temporarily unavailable. Please try again later." + DISCLAIMER_TEXT


# This function generates Indian meal suggestions based on test results and food preference
def generate_diet_suggestions(tests_list, preference, notes=""):
    client = get_groq_client()
    pref_label = preference.title() if preference else "Vegetarian"

    if not client:
        return (
            f"🥗 Balanced Indian Meal Plan ({pref_label}):\n\n"
            "• Breakfast: Oats vegetable upma or Moong dal cheela with mint chutney and warm water.\n"
            "• Lunch: 2 Multigrain rotis, a bowl of yellow dal/rajma, seasonal green subji (palak/methi), and fresh cucumber salad.\n"
            "• Evening Snack: Roasted makhana (fox nuts) or a handful of roasted chana with green tea.\n"
            "• Dinner: Light vegetable khichdi or grilled paneer/tofu salad with warm vegetable soup.\n\n"
            "Tip: Stay well hydrated (8-10 glasses of water daily) and limit refined sugars."
            + DISCLAIMER_TEXT
        )

    abnormal_notes = []
    for t in tests_list:
        if t["value"] > t["ref_max"]:
            abnormal_notes.append(f"{t['test_name']} is slightly high ({t['value']} {t['unit']})")
        elif t["value"] < t["ref_min"]:
            abnormal_notes.append(f"{t['test_name']} is slightly low ({t['value']} {t['unit']})")

    context_str = ", ".join(abnormal_notes) if abnormal_notes else "All recent tests are within normal range."

    system_prompt = (
        "You are HealthTrack AI's nutrition and wellness advisor.\n"
        "STRICT RULES:\n"
        "1. Create general, wholesome Indian meal suggestions tailored to the user's dietary preference (Vegetarian, Non-Vegetarian, or Vegan).\n"
        "2. Break down the plan into 4 clear meal categories: Breakfast, Lunch, Evening Snack, and Dinner.\n"
        "3. Emphasize home-cooked Indian foods (like dals, seasonal vegetables, millets, rotis, curd, salads).\n"
        "4. DO NOT prescribe medical diets, cure claims, or medical treatments.\n"
        "5. Keep the explanation friendly, practical, and easy for a beginner."
    )

    user_prompt = (
        f"Dietary Preference: {pref_label}\n"
        f"Health Context from recent tests: {context_str}\n"
        f"Additional User Notes: {notes if notes else 'None'}\n\n"
        f"Please provide an easy-to-follow daily Indian meal routine with Breakfast, Lunch, Evening Snack, and Dinner, plus 2-3 general lifestyle tips."
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            max_tokens=700
        )
        ai_response = chat_completion.choices[0].message.content
        return ai_response + DISCLAIMER_TEXT
    except Exception as e:
        print(f"[HealthTrack Server Error] Groq Diet API call failed: {e}", file=sys.stderr)
        return "Could not generate diet suggestions at this moment. Please try again later." + DISCLAIMER_TEXT
