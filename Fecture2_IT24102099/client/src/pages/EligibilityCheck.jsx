import React, { useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import ResultCard from "../components/ResultCard.jsx";
import TrendChart from "../components/TrendChart.jsx";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }).map((_, idx) => String(currentYear - idx));

export default function EligibilityCheck() {
  const { user } = useAuth();

  const [year, setYear] = useState(String(currentYear));
  const [stream, setStream] = useState("");
  const [district, setDistrict] = useState("");
  const [zScore, setZScore] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState([]);
  const [inputSummary, setInputSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [trendProgram, setTrendProgram] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function validate() {
    if (!year || !stream || !district || !zScore.trim()) {
      return "Please fill in all fields before checking eligibility.";
    }
    const z = Number(zScore);
    if (Number.isNaN(z)) {
      return "Z-score must be a number.";
    }
    if (z < 0 || z > 4) {
      return "Z-score must be between 0.0 and 4.0.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHasSubmitted(true);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setTrendProgram(null);

    try {
      const userId = user?._id || user?.id || localStorage.getItem("eligibility_userId") || null;

      const body = {
        userId: userId || undefined,
        stream,
        district,
        zScore: Number(zScore),
        year: Number(year),
      };

      const { data } = await api.post("/api/eligibility/check-eligibility", body);

      setResults(data.results || []);
      setMeta(data.meta || null);
      setInputSummary(data.input || { stream, district, zScore: Number(zScore), year: Number(year) });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch eligibility results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function renderAlternatives() {
    if (!hasSubmitted || isLoading || error || results.length > 0) return null;

    return (
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h5 style={{ marginBottom: 8 }}>❌ No direct matches found</h5>
        <p className="small" style={{ marginBottom: 12 }}>
          Don&apos;t worry — there are still great paths you can consider:
        </p>
        <ul className="small" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li><strong>Private / Non-state universities</strong> – consider IT, Business, or Allied Health programs that match your interests.</li>
          <li><strong>Foundation or bridging programs</strong> – improve your academic profile and re-apply with a stronger Z-score.</li>
          <li><strong>Higher National Diplomas (HND)</strong> – technical and vocational routes that can often lead to degree completion later.</li>
          <li><strong>Overseas or online degrees</strong> – explore flexible programs that accept your current qualifications.</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="elig-page container" style={{ animation: "fadeIn 0.4s ease", maxWidth: 1100 }}>
      <div className="row">
        <div className="col-12">
          <div className="card" style={{ marginBottom: 20, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: "1.8rem" }}>📊</span>
              <div>
                <h2 style={{ margin: 0 }}>Eligibility Check</h2>
                <p className="small" style={{ margin: "4px 0 0" }}>
                  Enter your A/L details to see <strong>eligibility, probability</strong>, and <strong>cutoff trends</strong> for university programs.
                </p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger elig-error-banner" style={{ marginTop: 12 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3" style={{ marginTop: 12 }}>
              <div className="col-md-3 col-12">
                <label className="small"><strong>Exam Year</strong></label>
                <select
                  className="form-select input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isLoading}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 col-12">
                <label className="small"><strong>Stream</strong></label>
                <select
                  className="form-select input"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">— Select Stream —</option>
                  {STREAMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 col-12">
                <label className="small"><strong>District</strong></label>
                <select
                  className="form-select input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">— Select District —</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 col-12">
                <label className="small"><strong>Z-Score</strong></label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="4"
                  className="form-control input"
                  value={zScore}
                  onChange={(e) => setZScore(e.target.value)}
                  placeholder="e.g. 1.55"
                  disabled={isLoading}
                />
              </div>

              <div className="col-12" style={{ marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Checking eligibility...
                    </>
                  ) : (
                    <>Check Eligibility 🎯</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {inputSummary && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info small" style={{ marginBottom: 16 }}>
              <strong>Summary:</strong> Stream <strong>{inputSummary.stream}</strong> | District{" "}
              <strong>{inputSummary.district}</strong> | Z-Score <strong>{inputSummary.zScore}</strong> | Year{" "}
              <strong>{inputSummary.year}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          {isLoading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div className="quiz-spinner" />
              <p className="small" style={{ marginTop: 12 }}>Analyzing programs and cutoffs...</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              {meta && (
                <p className="small" style={{ marginBottom: 10 }}>
                  ✅ Found <strong>{meta.count}</strong> eligible program{meta.count !== 1 ? "s" : ""} for you.
                </p>
              )}
              <div className="elig-results-grid">
                {results.map((r, i) => (
                  <ResultCard
                    key={r.degreeProgramId + "-" + i}
                    programName={r.programName}
                    universityName={r.universityName}
                    universityCode={r.universityCode}
                    degreeType={r.degreeType}
                    durationYears={r.durationYears}
                    careerTags={r.careerTags}
                    latestCutoff={r.latestCutoff}
                    diff={r.diff}
                    zScore={inputSummary?.zScore}
                    probabilityPercent={r.probabilityPercent}
                    probabilityLabel={r.probabilityLabel}
                    cutoffs3Years={r.cutoffs3Years}
                    onViewTrend={() => setTrendProgram(r)}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}

          {renderAlternatives()}
        </div>
      </div>

      {trendProgram && (
        <div className="elig-modal-overlay" onClick={() => setTrendProgram(null)}>
          <div className="elig-modal card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                Z-score Cutoff Trend (Last 3 Years) 📊 — {trendProgram.programName}
              </h3>
              <button
                className="btn secondary"
                style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={() => setTrendProgram(null)}
              >
                Close
              </button>
            </div>
            <TrendChart
              cutoffs={trendProgram.cutoffs3Years}
              studentZScore={inputSummary?.zScore}
              programName={trendProgram.programName}
            />
          </div>
        </div>
      )}
    </div>
  );
}



