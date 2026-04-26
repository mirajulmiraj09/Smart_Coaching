import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api/v1";

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("access_token");

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(
    data?.data?.detail || data?.detail || data?.message || `HTTP ${res.status}`
  );
  return data;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    user_check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    user_x: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
    approved: { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
    rejected: { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
    active:   { bg: "#D1FAE5", color: "#065F46", label: "Active" },
    inactive: { bg: "#F3F4F6", color: "#374151", label: "Inactive" },
  };
  const c = cfg[status] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{ background: c.bg, color: c.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
      {c.label}
    </span>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#EF4444" : "#10B981",
      color: "#fff", padding: "12px 20px", borderRadius: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,.18)", fontWeight: 600, fontSize: 14,
      display: "flex", alignItems: "center", gap: 10, minWidth: 240,
      animation: "slideUp .3s ease",
    }}>
      <Icon name={type === "error" ? "x" : "check"} size={16} />
      {msg}
    </div>
  );
};

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111" }}>{title}</h3>
      <p style={{ margin: "0 0 24px", color: "#555", fontSize: 14 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #D1D5DB", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: danger ? "#EF4444" : "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── REVIEW MODAL ─────────────────────────────────────────────────────────────
const ReviewModal = ({ center, onClose, onDone }) => {
  const [decision, setDecision] = useState("approve");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await apiFetch(`/centers/admin/applications/${center.coaching_center_id}/review/`, {
        method: "POST",
        body: JSON.stringify({ decision, review_note: note }),
      });
      onDone(decision === "approve" ? "Application approved successfully!" : "Application rejected.");
    } catch (e) {
      onDone(null, e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 480, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Review Application</h3>
        <p style={{ margin: "0 0 20px", color: "#666", fontSize: 13 }}>{center.center_name}</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {["approve", "reject"].map(d => (
            <button key={d} onClick={() => setDecision(d)} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
              border: decision === d ? "2px solid " + (d === "approve" ? "#10B981" : "#EF4444") : "2px solid #E5E7EB",
              background: decision === d ? (d === "approve" ? "#D1FAE5" : "#FEE2E2") : "#F9FAFB",
              color: decision === d ? (d === "approve" ? "#065F46" : "#991B1B") : "#374151",
            }}>
              {d === "approve" ? "✓ Approve" : "✗ Reject"}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Review note (optional)..." rows={3}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #D1D5DB", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
            background: decision === "approve" ? "#10B981" : "#EF4444", color: "#fff",
          }}>
            {loading ? "Processing…" : (decision === "approve" ? "Approve" : "Reject")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CENTER DETAIL MODAL ──────────────────────────────────────────────────────
const CenterDetailModal = ({ center, onClose }) => {
  const fields = [
    ["Center Name", center.center_name],
    ["Location", center.location],
    ["Address", center.address],
    ["Contact", center.contact_number],
    ["Email", center.email],
    ["Website", center.website],
    ["Access Type", center.access_type],
    ["Status", center.status],
    ["Established", center.established_date],
    ["Description", center.description],
    ["Applied By", (center.created_by?.name || "—") + (center.created_by?.email ? ` (${center.created_by.email})` : "")],
    ["Reviewed By", center.reviewed_by ? center.reviewed_by.name : "—"],
    ["Review Note", center.review_note || "—"],
    ["Applied On", center.created_at ? new Date(center.created_at).toLocaleString() : "—"],
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 560, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Center Details</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><Icon name="x" size={20} /></button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {fields.map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "9px 0", fontWeight: 600, color: "#374151", width: "38%", verticalAlign: "top" }}>{k}</td>
                <td style={{ padding: "9px 0", color: "#111", paddingLeft: 12 }}>
                  {k === "Status" ? <StatusBadge status={v} /> : (v || "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── LOGIN VIEW ───────────────────────────────────────────────────────────────
const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const userData = data.data;
      if (!userData?.tokens) throw new Error("No tokens received");

      // ✅ Only superuser can access system admin panel
      if (!userData.is_superuser) {
        throw new Error("Access denied. Only system administrators can access this panel.");
      }

      const { access, refresh } = userData.tokens;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("sysadmin_user", JSON.stringify(userData));
      onLogin(userData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 48, maxWidth: 400, width: "90%", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #4338CA, #7C3AED)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon name="shield" size={28} />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111" }}>System Admin</h1>
          <p style={{ margin: "6px 0 0", color: "#666", fontSize: 14 }}>Smart Coaching Center</p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid #E5E7EB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid #E5E7EB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #4338CA, #7C3AED)", color: "#fff",
            fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Signing in…" : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── APPLICATIONS TAB ─────────────────────────────────────────────────────────
const ApplicationsTab = ({ toast }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter !== "all"
        ? `/centers/admin/applications/?status=${statusFilter}`
        : "/centers/admin/applications/";
      const data = await apiFetch(url);
      setApps(Array.isArray(data) ? data : (data.results || data.data || []));
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleReviewDone = (msg, err) => {
    setReviewTarget(null);
    if (err) toast(err, "error");
    else { toast(msg); load(); }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/centers/admin/applications/${deleteTarget.coaching_center_id}/`, { method: "DELETE" });
      toast("Application deleted.");
      setDeleteTarget(null);
      load();
    } catch (e) { toast(e.message, "error"); setDeleteTarget(null); }
  };

  const counts = {
    total: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[["Total", counts.total, "#6366F1", "#EEF2FF"], ["Pending", counts.pending, "#F59E0B", "#FEF3C7"], ["Approved", counts.approved, "#10B981", "#D1FAE5"], ["Rejected", counts.rejected, "#EF4444", "#FEE2E2"]].map(([label, val, color, bg]) => (
          <div key={label} style={{ background: bg, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color, opacity: .8 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13 }}><Icon name="filter" size={14} /> Filter:</div>
        {["all", "pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (statusFilter === s ? "#4F46E5" : "#E5E7EB"),
            background: statusFilter === s ? "#EEF2FF" : "#fff", color: statusFilter === s ? "#4F46E5" : "#374151",
            fontWeight: 600, fontSize: 13, cursor: "pointer", textTransform: "capitalize",
          }}>{s}</button>
        ))}
        <button onClick={load} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          <Icon name="refresh" size={14} /> Refresh
        </button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading applications…</div> : apps.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF", fontSize: 15 }}>No applications found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["#", "Center Name", "Location", "Applicant", "Status", "Applied On", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 13, borderBottom: "2px solid #E5E7EB" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((app, i) => (
                <tr key={app.coaching_center_id} style={{ borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "12px 14px", color: "#9CA3AF" }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111" }}>{app.center_name}</td>
                  <td style={{ padding: "12px 14px", color: "#555" }}>{app.location || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{app.created_by?.name || "—"}</div>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>{app.created_by?.email || ""}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: "12px 14px", color: "#555", fontSize: 13 }}>{app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewTarget(app)} style={{ padding: "5px 8px", borderRadius: 7, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", color: "#6366F1" }}><Icon name="eye" size={14} /></button>
                      {app.status === "pending" && (
                        <button onClick={() => setReviewTarget(app)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Review</button>
                      )}
                      <button onClick={() => setDeleteTarget(app)} style={{ padding: "5px 8px", borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", color: "#EF4444" }}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewTarget && <ReviewModal center={reviewTarget} onClose={() => setReviewTarget(null)} onDone={handleReviewDone} />}
      {viewTarget && <CenterDetailModal center={viewTarget} onClose={() => setViewTarget(null)} />}
      {deleteTarget && <ConfirmModal title="Delete Application" message={`Delete application for "${deleteTarget.center_name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
};

// ─── CENTERS TAB ──────────────────────────────────────────────────────────────
const CentersTab = ({ toast }) => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/centers/admin/");
      setCenters(Array.isArray(data) ? data : (data.results || data.data || []));
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await apiFetch(`/centers/admin/${deleteTarget.coaching_center_id}/`, { method: "DELETE" });
      toast("Center deleted.");
      setDeleteTarget(null);
      load();
    } catch (e) { toast(e.message, "error"); setDeleteTarget(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontWeight: 700, color: "#374151", fontSize: 15 }}>All Coaching Centers ({centers.length})</span>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          <Icon name="refresh" size={14} /> Refresh
        </button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading centers…</div> : centers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>No centers found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
          {centers.map(c => (
            <div key={c.coaching_center_id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111", flex: 1, marginRight: 8 }}>{c.center_name}</div>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280", fontSize: 13, marginBottom: 5 }}>
                <Icon name="location" size={13} /> {c.location || "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6B7280", fontSize: 13, marginBottom: 12 }}>
                <Icon name="mail" size={13} /> {c.email || c.contact_number || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
                Owner: <strong style={{ color: "#374151" }}>{c.created_by?.name || "—"}</strong>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setViewTarget(c)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#4F46E5" }}>
                  View Details
                </button>
                <button onClick={() => setDeleteTarget(c)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", color: "#EF4444" }}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewTarget && <CenterDetailModal center={viewTarget} onClose={() => setViewTarget(null)} />}
      {deleteTarget && <ConfirmModal title="Delete Center" message={`Permanently delete "${deleteTarget.center_name}"?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
};

// ─── USERS TAB ────────────────────────────────────────────────────────────────
const UsersTab = ({ toast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const roles = ["all", "coaching_admin", "coaching_manager", "coaching_staff", "teacher", "student"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = roleFilter !== "all" ? `/admin/users/?role=${roleFilter}` : "/admin/users/";
      const data = await apiFetch(url);
      setUsers(Array.isArray(data) ? data : (data.results || data.data || []));
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user) => {
    const ep = user.is_active ? "deactivate" : "activate";
    try {
      await apiFetch(`/admin/users/${user.user_id}/${ep}/`, { method: "PATCH" });
      toast(`User ${ep}d successfully.`);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/admin/users/${deleteTarget.user_id}/`, { method: "DELETE" });
      toast("User deleted.");
      setDeleteTarget(null);
      load();
    } catch (e) { toast(e.message, "error"); setDeleteTarget(null); }
  };

  const roleColor = (r) => ({ coaching_admin: "#7C3AED", coaching_manager: "#2563EB", coaching_staff: "#0891B2", teacher: "#059669", student: "#D97706" }[r] || "#6B7280");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13 }}><Icon name="filter" size={14} /> Role:</div>
        {roles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (roleFilter === r ? "#4F46E5" : "#E5E7EB"),
            background: roleFilter === r ? "#EEF2FF" : "#fff", color: roleFilter === r ? "#4F46E5" : "#374151",
            fontWeight: 600, fontSize: 12, cursor: "pointer",
          }}>{r === "all" ? "All" : r.replace(/_/g, " ")}</button>
        ))}
        <button onClick={load} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          <Icon name="refresh" size={14} /> Refresh
        </button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading users…</div> : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>No users found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["#", "Name", "Email", "Phone", "Role", "Status", "Verified", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 13, borderBottom: "2px solid #E5E7EB" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.user_id} style={{ borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "12px 14px", color: "#9CA3AF" }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111" }}>
                    {u.name}
                    {u.is_superuser && <span style={{ marginLeft: 6, fontSize: 10, background: "#EDE9FE", color: "#7C3AED", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>SUPER</span>}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#555" }}>{u.email}</td>
                  <td style={{ padding: "12px 14px", color: "#555" }}>{u.phone || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: roleColor(u.role), background: roleColor(u.role) + "18", padding: "2px 9px", borderRadius: 20 }}>
                      {u.role?.replace(/_/g, " ") || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: u.is_active ? "#065F46" : "#991B1B", background: u.is_active ? "#D1FAE5" : "#FEE2E2", padding: "2px 9px", borderRadius: 20 }}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: u.email_verified ? "#065F46" : "#92400E", background: u.email_verified ? "#D1FAE5" : "#FEF3C7", padding: "2px 9px", borderRadius: 20 }}>
                      {u.email_verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!u.is_superuser && (
                        <button onClick={() => toggleActive(u)} title={u.is_active ? "Deactivate" : "Activate"} style={{
                          padding: "5px 8px", borderRadius: 7,
                          border: "1.5px solid " + (u.is_active ? "#FEE2E2" : "#D1FAE5"),
                          background: u.is_active ? "#FEF2F2" : "#ECFDF5", cursor: "pointer",
                          color: u.is_active ? "#EF4444" : "#10B981",
                        }}>
                          <Icon name={u.is_active ? "user_x" : "user_check"} size={14} />
                        </button>
                      )}
                      {!u.is_superuser && (
                        <button onClick={() => setDeleteTarget(u)} style={{ padding: "5px 8px", borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", color: "#EF4444" }}>
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deleteTarget && <ConfirmModal title="Delete User" message={`Delete user "${deleteTarget.name}" (${deleteTarget.email})? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/centers/admin/applications/"),
      apiFetch("/centers/admin/"),
      apiFetch("/admin/users/"),
    ]).then(([apps, centers, users]) => {
      const a = Array.isArray(apps) ? apps : (apps.results || apps.data || []);
      const c = Array.isArray(centers) ? centers : (centers.results || centers.data || []);
      const u = Array.isArray(users) ? users : (users.results || users.data || []);
      setStats({
        totalApps: a.length, pendingApps: a.filter(x => x.status === "pending").length,
        totalCenters: c.length, approvedCenters: c.filter(x => x.status === "approved").length,
        totalUsers: u.length, activeUsers: u.filter(x => x.is_active).length,
      });
    }).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "Total Applications", val: stats.totalApps, sub: `${stats.pendingApps} pending`, color: "#6366F1", bg: "#EEF2FF", icon: "clipboard", tab: "applications" },
    { label: "Coaching Centers", val: stats.totalCenters, sub: `${stats.approvedCenters} approved`, color: "#10B981", bg: "#D1FAE5", icon: "building", tab: "centers" },
    { label: "Total Users", val: stats.totalUsers, sub: `${stats.activeUsers} active`, color: "#F59E0B", bg: "#FEF3C7", icon: "users", tab: "users" },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#111" }}>System Overview</h2>
        <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>Welcome back, System Admin. Here's what's happening.</p>
      </div>
      {!stats ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading stats…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 32 }}>
          {cards.map(c => (
            <div key={c.label} onClick={() => onNavigate(c.tab)} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 16, padding: 24, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.04)", transition: "transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; }}>
              <div style={{ width: 44, height: 44, background: c.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: c.color }}>
                <Icon name={c.icon} size={22} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#111", marginBottom: 4 }}>{c.val}</div>
              <div style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}>{c.label}</div>
              <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 24, border: "1.5px solid #E5E7EB" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#374151" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["Review Pending Applications", "applications", "#4F46E5"], ["View All Centers", "centers", "#059669"], ["Manage Users", "users", "#D97706"]].map(([label, tab, color]) => (
            <button key={tab} onClick={() => onNavigate(tab)} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: color, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sysadmin_user")); } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("sysadmin_user");
    setUser(null);
  };

  // ✅ If not superuser — show login
  if (!user) return <LoginView onLogin={handleLogin} />;

  const tabs = [
    { id: "overview",      label: "Overview",      icon: "dashboard"  },
    { id: "applications",  label: "Applications",  icon: "clipboard"  },
    { id: "centers",       label: "Centers",       icon: "building"   },
    { id: "users",         label: "Users",         icon: "users"      },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "linear-gradient(180deg, #1E1B4B 0%, #312E81 100%)", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Icon name="shield" size={18} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>System Admin</div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>Smart Coaching</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 10px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 12px",
              borderRadius: 10, border: "none", marginBottom: 4, cursor: "pointer",
              background: activeTab === t.id ? "rgba(255,255,255,.15)" : "transparent",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,.6)",
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 14, textAlign: "left", transition: "all .15s",
            }}>
              <Icon name={t.icon} size={17} /> {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 10px 24px" }}>
          <div style={{ padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
          {/* ✅ Back to main site */}
          <button onClick={() => navigate('/')} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", borderRadius: 10, border: "none", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontWeight: 600, fontSize: 12, marginBottom: 6 }}>
            ← Back to Site
          </button>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.15)", color: "#FCA5A5", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            <Icon name="logout" size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, padding: 32 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 28, minHeight: "calc(100vh - 64px)", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1.5px solid #F3F4F6" }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          {activeTab === "overview"     && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === "applications" && <ApplicationsTab toast={showToast} />}
          {activeTab === "centers"      && <CentersTab toast={showToast} />}
          {activeTab === "users"        && <UsersTab toast={showToast} />}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}