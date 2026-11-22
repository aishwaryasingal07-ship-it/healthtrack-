// HealthTrack AI - Client-side JavaScript

// This function shows the loading indicator and disables the submit button during AI generation
function showAiLoading(buttonId, loadingText = "Analyzing with Groq AI... Please wait") {
    const loadingBox = document.getElementById("ai-loading-box");
    if (loadingBox) {
        loadingBox.style.display = "block";
    }
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    }
}

// This function initializes the Chart.js line chart for health history comparison
function renderHistoryChart(canvasId, dates, values, refMin, refMax, unit, testName) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Check if Chart.js library is loaded via CDN
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: `${testName} (${unit})`,
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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} ${unit}`;
                        }
                    }
                },
                legend: {
                    position: "top",
                    labels: {
                        boxWidth: 14,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    suggestedMin: Math.max(0, Math.min(...values, refMin) * 0.85),
                    suggestedMax: Math.max(...values, refMax) * 1.15,
                    title: {
                        display: true,
                        text: `Measurement (${unit})`
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Test Date"
                    }
                }
            }
        }
    });
}

// Auto-fill common test presets in the Add Test form for convenience
function fillTestPreset(name, unit, minVal, maxVal) {
    const nameInput = document.getElementById("test_name");
    const unitInput = document.getElementById("unit");
    const minInput = document.getElementById("ref_min");
    const maxInput = document.getElementById("ref_max");

    if (nameInput) nameInput.value = name;
    if (unitInput) unitInput.value = unit;
    if (minInput) minInput.value = minVal;
    if (maxInput) maxInput.value = maxVal;
}
