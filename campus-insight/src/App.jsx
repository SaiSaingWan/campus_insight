import React, { useState, useEffect } from 'react';
import { fetchLecturerAvailability } from './services/advisingApi';

const INITIAL_LECTURERS = [
  {
    id: "lec_1",
    name: "Dr. John Doe",
    email: "john.doe@mfu.ac.th",
    department: "School of Information Technology",
    office: "E3B-502",
    rating: 4.8,
    reviews: 24
  },
  {
    id: "lec_2",
    name: "Dr. Jane Smith",
    email: "jane.smith@mfu.ac.th",
    department: "Computer Engineering",
    office: "E3B-509",
    rating: 4.9,
    reviews: 31
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("lecturers");
  const [lecturers, setLecturers] = useState(INITIAL_LECTURERS);
  const [selectedLecturer, setSelectedLecturer] = useState(INITIAL_LECTURERS[0]);
  
  const [schedules, setSchedules] = useState([]);
  const [isDegraded, setIsDegraded] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", department: "", office: "", rating: 5.0, reviews: 0 });

  const [logs] = useState([
    { eventId: "evt_101", eventType: "slot_booked", lecturerEmail: "john.doe@mfu.ac.th", time: "2026-09-22 19:42:10", status: "200 Verified" },
    { eventId: "evt_100", eventType: "slot_canceled", lecturerEmail: "jane.smith@mfu.ac.th", time: "2026-09-22 18:15:00", status: "200 Verified" }
  ]);

  useEffect(() => {
    if (selectedLecturer) {
      loadPartnerSchedule(selectedLecturer.email);
    }
  }, [selectedLecturer]);

  const loadPartnerSchedule = async (email) => {
    setLoadingSchedule(true);
    const res = await fetchLecturerAvailability(email);
    setSchedules(res.schedules);
    setIsDegraded(!res.success);
    setLoadingSchedule(false);
  };

  const handleOpenAdd = () => {
    setFormData({ id: `lec_${Date.now()}`, name: "", email: "", department: "School of Information Technology", office: "E3B-100", rating: 5.0, reviews: 0 });
    setIsEditing(false);
  };

  const handleOpenEdit = (lec) => {
    setFormData(lec);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    const updated = lecturers.filter(l => l.id !== id);
    setLecturers(updated);
    if (selectedLecturer?.id === id) {
      setSelectedLecturer(updated[0] || null);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return alert("Please fill in Name and Email");

    if (isEditing) {
      setLecturers(lecturers.map(l => l.id === formData.id ? formData : l));
      if (selectedLecturer?.id === formData.id) setSelectedLecturer(formData);
    } else {
      const newList = [...lecturers, formData];
      setLecturers(newList);
      setSelectedLecturer(formData);
    }
    setFormData({ id: "", name: "", email: "", department: "", office: "", rating: 5.0, reviews: 0 });
  };

  return (
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh", backgroundColor: "#0b0f19", color: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: "280px", minWidth: "280px", backgroundColor: "#111827", borderRight: "1px solid #1f2937", padding: "2rem 1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: "1.2rem", color: "#fff" }}>C</div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "#fff" }}>Campus Insight</h2>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>v2.4 Enterprise</span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button 
              onClick={() => setActiveTab("lecturers")}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === "lecturers" ? "#1e293b" : "transparent",
                color: activeTab === "lecturers" ? "#38bdf8" : "#94a3b8",
                fontWeight: activeTab === "lecturers" ? "600" : "400", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}
            >
              👨‍🏫 Lecturer Directory
            </button>
            <button 
              onClick={() => setActiveTab("webhooks")}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === "webhooks" ? "#1e293b" : "transparent",
                color: activeTab === "webhooks" ? "#38bdf8" : "#94a3b8",
                fontWeight: activeTab === "webhooks" ? "600" : "400", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}
            >
              ⚡ Webhook Logs
            </button>
          </nav>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "1rem", borderRadius: "10px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Render Backend Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#4ade80" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></span>
            Live (Online)
          </div>
        </div>
      </aside>

      {/* Main Full Width Desktop Canvas */}
      <main style={{ flex: 1, padding: "2.5rem 3rem", overflowY: "auto", minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #1f2937", paddingBottom: "1.5rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.85rem", fontWeight: "700" }}>
              {activeTab === "lecturers" ? "Lecturer & Integration Management" : "Live Webhook Audit Stream"}
            </h1>
            <p style={{ margin: "0.35rem 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              {activeTab === "lecturers" ? "Manage campus faculty and sync real-time advising availability" : "Monitor incoming partner event payloads in real-time"}
            </p>
          </div>
          {activeTab === "lecturers" && (
            <button 
              onClick={handleOpenAdd}
              style={{
                backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px",
                fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem"
              }}
            >
              + Add New Lecturer
            </button>
          )}
        </header>

        {/* TAB 1: LECTURERS & INTEGRATION (FULL DESKTOP SPLIT) */}
        {activeTab === "lecturers" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2.5rem", width: "100%" }}>
            
            {/* Left Column: Form & Directory List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              
              {/* Form Card */}
              <div style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.75rem" }}>
                <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.15rem", color: "#f8fafc" }}>
                  {formData.id && isEditing ? `Edit: ${formData.name}` : "Create New Lecturer Record"}
                </h3>
                <form onSubmit={handleSaveForm} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input 
                    type="text" placeholder="Full Name (e.g. Dr. Jane)" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                  <input 
                    type="email" placeholder="Email (e.g. jane@mfu.ac.th)" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                  <input 
                    type="text" placeholder="Department" value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                  <input 
                    type="text" placeholder="Office (e.g. E3B-502)" value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem" }}
                  />
                  <div style={{ gridColumn: "span 2", display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    {isEditing && (
                      <button type="button" onClick={handleOpenAdd} style={{ backgroundColor: "#334155", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                    )}
                    <button type="submit" style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                      {isEditing ? "Save Changes" : "Create Record"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Directory List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <h3 style={{ margin: "0.5rem 0", fontSize: "1.05rem", color: "#94a3b8" }}>Faculty Directory ({lecturers.length})</h3>
                {lecturers.map((lec) => {
                  const isSelected = selectedLecturer?.id === lec.id;
                  return (
                    <div 
                      key={lec.id}
                      onClick={() => setSelectedLecturer(lec)}
                      style={{
                        backgroundColor: isSelected ? "#1e293b" : "#111827",
                        border: isSelected ? "1px solid #38bdf8" : "1px solid #1f2937",
                        borderRadius: "10px", padding: "1.1rem 1.5rem", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "1.05rem", color: "#f8fafc" }}>{lec.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>{lec.email} • {lec.office}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(lec); }} style={{ backgroundColor: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(lec.id); }} style={{ backgroundColor: "transparent", border: "1px solid #7f1d1d", color: "#f87171", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Integration Inspector */}
            <div>
              {selectedLecturer ? (
                <div style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.75rem", sticky: "top" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Advising Integration</span>
                      <h2 style={{ margin: "0.25rem 0 0 0", fontSize: "1.4rem" }}>{selectedLecturer.name}</h2>
                      <p style={{ margin: "0.2rem 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>{selectedLecturer.department}</p>
                    </div>
                    <button 
                      onClick={() => loadPartnerSchedule(selectedLecturer.email)}
                      style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      {loadingSchedule ? "Syncing..." : "🔄 Refresh API"}
                    </button>
                  </div>

                  {/* Degradation Banner */}
                  {isDegraded ? (
                    <div style={{ backgroundColor: "#451a03", border: "1px solid #78350f", color: "#fde68a", padding: "1rem", borderRadius: "10px", fontSize: "0.88rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
                      <strong>⚠️ Degradation / Fallback Mode Active:</strong> Partner API unreachable or returning 404. Displaying cached office hours to ensure system uptime.
                    </div>
                  ) : (
                    <div style={{ backgroundColor: "#064e3b", border: "1px solid #065f46", color: "#a7f3d0", padding: "1rem", borderRadius: "10px", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                      <strong>✅ Live Cloudflare D1 Sync Active:</strong> Connected to Advising Platform endpoints.
                    </div>
                  )}

                  <h4 style={{ margin: "0 0 1rem 0", color: "#94a3b8", fontSize: "0.95rem" }}>Published Advising Slots</h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {schedules.map((slot, idx) => (
                      <div key={idx} style={{ backgroundColor: "#1e293b", padding: "1rem 1.25rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#f1f5f9" }}>📅 {slot.date}</div>
                          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>Time: {slot.time}</div>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", padding: "0.35rem 0.75rem", borderRadius: "12px", backgroundColor: isDegraded ? "#78350f" : "#065f46", color: isDegraded ? "#fde68a" : "#a7f3d0" }}>
                          {slot.status || "Available"}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b", border: "1px dashed #1f2937", borderRadius: "12px" }}>
                  Select a lecturer from the directory to inspect availability.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: WEBHOOK LOGS */}
        {activeTab === "webhooks" && (
          <div style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "2rem", width: "100%" }}>
            <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.2rem" }}>Inbound Partner Webhook History</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f2937", color: "#64748b" }}>
                  <th style={{ padding: "0.85rem 0" }}>Event ID</th>
                  <th>Type</th>
                  <th>Lecturer Email</th>
                  <th>Timestamp</th>
                  <th>Signature Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.eventId} style={{ borderBottom: "1px solid #1e293b", color: "#cbd5e1" }}>
                    <td style={{ padding: "0.85rem 0", fontFamily: "monospace", color: "#38bdf8" }}>{log.eventId}</td>
                    <td><span style={{ backgroundColor: "#1e293b", padding: "0.25rem 0.6rem", borderRadius: "4px" }}>{log.eventType}</span></td>
                    <td>{log.lecturerEmail}</td>
                    <td>{log.time}</td>
                    <td><span style={{ color: "#4ade80", fontWeight: "600" }}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

    </div>
  );
}