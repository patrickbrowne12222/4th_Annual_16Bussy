import { useState, useEffect, useCallback } from "react";

// ─── GOOGLE SHEETS BACKEND ─────────────────────────────────
// Set this in your .env file or Vercel environment variables:
//   VITE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || "";

async function fetchRoster() {
  if (!SHEETS_URL) return [];
  try {
    const res = await fetch(SHEETS_URL);
    const data = await res.json();
    return data.participants || [];
  } catch (e) {
    console.error("Failed to fetch roster:", e);
    return [];
  }
}

async function saveToSheet(action, participant) {
  if (!SHEETS_URL) return false;
  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action, participant }),
    });
    return true;
  } catch (e) {
    console.error("Failed to save:", e);
    return false;
  }
}

// ─── DATA ───────────────────────────────────────────────────

const SCHEDULE = [
  { day: "Thursday", date: "Oct 8", course: "Manistee National", firstTee: "2:00 PM", format: "2-Man Scramble", points: 4 },
  { day: "Friday", date: "Oct 9", course: "The South Course", firstTee: "8:31 AM", format: "Alternate Shot", points: 4 },
  { day: "Friday", date: "Oct 9", course: "The Bluffs Course", firstTee: "2:00 PM", format: "High-Low", points: 4 },
  { day: "Saturday", date: "Oct 10", course: "The Bluffs Course", firstTee: "9:00 AM", format: "Best Ball", points: 4 },
  { day: "Saturday", date: "Oct 10", course: "The Dozen", firstTee: "3:30 PM", format: "Scramble", points: 6 },
  { day: "Sunday", date: "Oct 11", course: "The South Course", firstTee: "8:31 AM", format: "Singles Match Play", points: 8 },
];

const COURSES = [
  { name: "The Bluffs Course", rank: "#16 Golf Digest Top 100 Public", tees: ["2:00, 2:10, 2:20, 2:30 PM (Fri)", "9:00, 9:10, 9:20, 9:30 AM (Sat)"], holes: 18 },
  { name: "The South Course", rank: "#53 Golf Digest Top 100 Public", tees: ["8:31, 8:42, 8:53, 9:04 AM (Fri)", "8:31, 8:42, 8:53, 9:04 AM (Sun)"], holes: 18 },
  { name: "The Dozen", rank: "Unique 12-hole experience", tees: ["3:30, 3:42, 3:54, 4:06 PM (Sat)"], holes: 12 },
  { name: "Manistee National", rank: "Regional favorite", tees: ["Thursday afternoon beginning at 2 PM"], holes: 18 },
];

const AIRPORTS = [
  { code: "TVC", city: "Traverse City", drive: "1 hr 5 min", pct: 0.2 },
  { code: "GRR", city: "Grand Rapids", drive: "2 hr 40 min", pct: 0.5 },
  { code: "DTW", city: "Detroit", drive: "4 hr 5 min", pct: 0.77 },
  { code: "MDW", city: "Chicago Midway", drive: "5 hr", pct: 0.9 },
  { code: "ORD", city: "Chicago O'Hare", drive: "5 hr 15 min", pct: 1.0 },
];

const PAST_TRIPS = [
  { year: 2023, label: "1st Annual", champions: ["Patrick Browne", "Noah Meiser", "Charlie Wheeler", "Harrison Martin"] },
  { year: 2024, label: "2nd Annual", champions: ["Patrick Browne", "Noah Meiser", "Jack Fischer", "Harrison Martin", "Jason Chang", "Quinn Denvir"] },
  { year: 2025, label: "3rd Annual", champions: ["Patrick Browne", "Noah Meiser", "Jack Fischer", "Harrison Martin", "Jason Chang", "Jake Herman", "Caden Kelley", "Nicholas Sampson"] },
];

function getWinCounts() {
  const counts = {};
  PAST_TRIPS.forEach(t => t.champions.forEach(name => { counts[name] = (counts[name] || 0) + 1; }));
  return counts;
}
const WIN_COUNTS = getWinCounts();

function TrophyIcons({ count }) {
  if (!count) return null;
  return (
    <span style={{ marginLeft: 4, fontSize: 11, letterSpacing: 1 }} title={`${count} championship${count > 1 ? "s" : ""}`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "-1px", marginLeft: i > 0 ? -1 : 0 }}>
          <path d="M7 4V2h10v2h3a2 2 0 012 2v1c0 2.5-1.5 4.5-3.7 5.3C17.3 16 15 17 13 17.5V20h3v2H8v-2h3v-2.5C9 17 6.7 16 5.7 13.3 3.5 12.5 2 10.5 2 8V6a2 2 0 012-2h3zm-3 4c0 1.3.8 2.5 2 3.2V6H4v2zm16 0V6h-2v5.2c1.2-.7 2-1.9 2-3.2z" fill="#c9b97a"/>
        </svg>
      ))}
    </span>
  );
}

const NAV_ITEMS = ["Schedule", "Courses", "Details", "Travel", "Roster", "History"];

// ─── COMPONENTS ─────────────────────────────────────────────

function Nav({ active, setActive }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(28,35,24,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, color: "#c9b97a", letterSpacing: 1, whiteSpace: "nowrap", padding: "14px 12px 14px 0", borderRight: "1px solid rgba(255,255,255,0.08)", marginRight: 8 }}>16B</span>
        {NAV_ITEMS.map(item => (
          <button key={item} onClick={() => setActive(item)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "14px 14px",
            fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase",
            color: active === item ? "#c9b97a" : "rgba(255,255,255,0.45)",
            borderBottom: active === item ? "2px solid #c9b97a" : "2px solid transparent",
            transition: "all 0.2s", whiteSpace: "nowrap", fontWeight: 500
          }}>{item}</button>
        ))}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div style={{ background: "linear-gradient(165deg, #1c2318 0%, #2a3325 40%, #1a2016 100%)", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#c9b97a", marginBottom: 16, fontWeight: 500 }}>The 4th Annual</p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 700, color: "#f5f0e4", lineHeight: 1.05, margin: "0 0 12px" }}>
          16Bussy<br />Invitational
        </h1>
        <div style={{ width: 60, height: 2, background: "#c9b97a", margin: "20px auto" }} />
        <p style={{ fontSize: 16, color: "rgba(245,240,228,0.7)", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", marginBottom: 8 }}>Arcadia, Michigan</p>
        <p style={{ fontSize: 22, color: "#f5f0e4", fontWeight: 600, letterSpacing: 1 }}>October 8–11, 2026</p>
        <div style={{ display: "inline-flex", gap: 24, marginTop: 28, padding: "14px 28px", background: "rgba(201,185,122,0.08)", borderRadius: 8, border: "1px solid rgba(201,185,122,0.15)" }}>
          {[["6", "Rounds"], ["4", "Days"], ["4", "Courses"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#c9b97a", fontFamily: "'Playfair Display', Georgia, serif" }}>{n}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(245,240,228,0.5)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "10px 22px", display: "inline-block", background: "rgba(201,185,122,0.06)", borderRadius: 6, border: "1px solid rgba(201,185,122,0.1)" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#c9b97a", fontFamily: "'Playfair Display', Georgia, serif" }}>15.5 points</span>
          <span style={{ fontSize: 13, color: "rgba(245,240,228,0.5)" }}> to claim </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f5f0e4", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>the Bussy Jacket</span>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} style={{ padding: "48px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e4", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 28px" }}>{subtitle}</p>}
      {children}
    </section>
  );
}

function Divider() {
  return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}><div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} /></div>;
}

function ScheduleSection() {
  return (
    <Section id="Schedule" title="Tournament schedule" subtitle="6 rounds across 4 days — 15.5 points to claim the Bussy Jacket">
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 100px 140px 1fr", gap: 0, padding: "10px 20px", background: "rgba(201,185,122,0.06)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(201,185,122,0.6)", fontWeight: 600 }}>
          <span>Date</span><span>Course</span><span>First tee</span><span>Format</span><span style={{ textAlign: "right" }}>Points per match</span>
        </div>
        {SCHEDULE.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "90px 1fr 100px 140px 1fr", gap: 0,
            padding: "14px 20px", background: i % 2 === 0 ? "rgba(42,51,37,0.5)" : "rgba(36,44,32,0.4)", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f0e4" }}>{r.day}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{r.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f0e4" }}>{r.course}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{r.firstTee}</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, color: "#8b9a6b" }}>{r.format}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a", textAlign: "right", fontFamily: "'Playfair Display', Georgia, serif" }}>{r.points}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CoursesSection() {
  const [open, setOpen] = useState(0);
  return (
    <Section id="Courses" title="The courses" subtitle="World-class golf on Michigan's Gold Coast">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {COURSES.map((c, i) => (
          <div key={i} onClick={() => setOpen(i)} style={{
            padding: "20px", borderRadius: 10, cursor: "pointer", transition: "all 0.25s",
            background: open === i ? "rgba(201,185,122,0.08)" : "rgba(42,51,37,0.4)",
            border: open === i ? "1px solid rgba(201,185,122,0.25)" : "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f0e4", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>{c.name}</h3>
              <span style={{ fontSize: 11, background: "rgba(201,185,122,0.12)", color: "#c9b97a", padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{c.holes}H</span>
            </div>
            <p style={{ fontSize: 12, color: "#c9b97a", fontWeight: 600, margin: "0 0 12px" }}>{c.rank}</p>
            <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Tee times</div>
            {c.tees.map((t, j) => (
              <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontFamily: "monospace" }}>{t}</div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function DetailsSection() {
  return (
    <Section id="Details" title="Pricing & lodging" subtitle="Everything you need to know for the trip">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 24, borderRadius: 10, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#c9b97a", margin: "0 0 16px", fontWeight: 500 }}>Cost breakdown</h3>
          {[
            { item: "Lodging", detail: "Full breakfast included", cost: "$650" },
            { item: "Golf", detail: "6 rounds", cost: "$825" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div>
                <span style={{ fontSize: 14, color: "#f5f0e4" }}>{p.item}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>{p.detail}</span>
              </div>
              <span style={{ fontSize: 14, color: "#f5f0e4", fontFamily: "'Playfair Display', Georgia, serif" }}>{p.cost}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderTop: "1px solid rgba(201,185,122,0.15)", marginTop: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a" }}>Total per person</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#c9b97a", fontFamily: "'Playfair Display', Georgia, serif" }}>$1,475</span>
          </div>
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 6, background: "rgba(201,185,122,0.08)", border: "1px solid rgba(201,185,122,0.12)", fontSize: 12, color: "#c9b97a", lineHeight: 1.6 }}>
            $216 deposit already collected — remaining balance of <strong style={{ color: "#f5f0e4" }}>$1,259</strong> due before the trip.
          </div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#c9b97a", margin: "0 0 16px", fontWeight: 500 }}>Lodging</h3>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e4", margin: "0 0 6px", fontFamily: "'Playfair Display', Georgia, serif" }}>Arcadia Bluffs Cottages</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Two private cottages on the resort grounds, walking distance to the first tee.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["2", "Cottages"], ["16", "Beds total"], ["8", "Bathrooms"], ["\u2713", "Free breakfast"]].map(([n, l]) => (
              <div key={l} style={{ padding: "12px", borderRadius: 6, background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#c9b97a", fontFamily: "'Playfair Display', Georgia, serif" }}>{n}</div>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "14px 0 0", lineHeight: 1.5 }}>
            Two twin beds per room. Each cottage has 8 beds and 4 bathrooms.
          </p>
        </div>
      </div>
    </Section>
  );
}

function TravelSection() {
  return (
    <Section id="Travel" title="Getting there" subtitle="Arcadia is on Michigan's northwest coast — accessible from several airports">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {AIRPORTS.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 160px 1fr 110px", gap: 12, alignItems: "center", padding: "12px 16px", borderRadius: 8, background: i === 0 ? "rgba(201,185,122,0.06)" : "transparent", border: i === 0 ? "1px solid rgba(201,185,122,0.12)" : "1px solid transparent" }}>
            <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: i === 0 ? "#c9b97a" : "#f5f0e4", letterSpacing: 1 }}>{a.code}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{a.city}</span>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${a.pct * 100}%`, borderRadius: 3, background: i === 0 ? "#c9b97a" : "rgba(139,154,107,0.5)", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: 13, color: i === 0 ? "#c9b97a" : "rgba(255,255,255,0.5)", textAlign: "right", fontWeight: i === 0 ? 600 : 400 }}>{a.drive}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 18px", borderRadius: 8, background: "rgba(201,185,122,0.06)", border: "1px solid rgba(201,185,122,0.12)", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
        <span style={{ color: "#c9b97a", fontWeight: 600 }}>Chicago crew:</span> Multiple cars will be leaving from the Chicago area. Coordinate rides in the roster below — add your airport and car plans so everyone can link up.
      </div>
    </Section>
  );
}

function RosterSection() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", handicap: "", ghin: "", airport: "", arrival: "", departure: "", carPlans: "" });
  const [editIdx, setEditIdx] = useState(-1);

  useEffect(() => {
    fetchRoster().then(data => { setParticipants(data); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const entry = {
      ...form,
      handicap: form.handicap ? parseFloat(form.handicap) : null,
      id: editIdx >= 0 ? participants[editIdx].id : String(Date.now()),
    };
    const action = editIdx >= 0 ? "update" : "add";
    const success = await saveToSheet(action, entry);
    if (success) {
      const fresh = await fetchRoster();
      setParticipants(fresh);
    } else {
      // Optimistic update if fetch fails
      if (editIdx >= 0) {
        setParticipants(prev => prev.map((p, i) => i === editIdx ? entry : p));
      } else {
        setParticipants(prev => [...prev, entry]);
      }
    }
    resetForm();
    setSaving(false);
  };

  const handleDelete = async (i) => {
    setSaving(true);
    const participant = participants[i];
    await saveToSheet("delete", participant);
    const fresh = await fetchRoster();
    setParticipants(fresh.length ? fresh : participants.filter((_, idx) => idx !== i));
    setSaving(false);
  };

  const resetForm = () => {
    setForm({ name: "", handicap: "", ghin: "", airport: "", arrival: "", departure: "", carPlans: "" });
    setShowForm(false);
    setEditIdx(-1);
  };

  const handleEdit = (i) => {
    const p = participants[i];
    setForm({ name: p.name || "", handicap: p.handicap != null ? String(p.handicap) : "", ghin: p.ghin || "", airport: p.airport || "", arrival: p.arrival || "", departure: p.departure || "", carPlans: p.carPlans || "" });
    setEditIdx(i);
    setShowForm(true);
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "#f5f0e4", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4, display: "block" };

  return (
    <Section id="Roster" title="Participant roster" subtitle="Add your info so everyone can coordinate travel and tee times">
      {!SHEETS_URL && (
        <div style={{ padding: "12px 16px", borderRadius: 6, background: "rgba(200,100,100,0.1)", border: "1px solid rgba(200,100,100,0.2)", fontSize: 12, color: "rgba(200,100,100,0.7)", marginBottom: 16 }}>
          Roster backend not connected. See the setup guide to enable Google Sheets integration.
        </div>
      )}

      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditIdx(-1); setForm({ name: "", handicap: "", ghin: "", airport: "", arrival: "", departure: "", carPlans: "" }); }} style={{
          padding: "12px 24px", borderRadius: 8, border: "1px solid rgba(201,185,122,0.3)",
          background: "rgba(201,185,122,0.08)", color: "#c9b97a", cursor: "pointer",
          fontSize: 13, fontWeight: 600, letterSpacing: 0.5, marginBottom: 20, display: "block",
          opacity: saving ? 0.5 : 1, pointerEvents: saving ? "none" : "auto"
        }}>+ Add yourself</button>
      )}

      {showForm && (
        <div style={{ padding: 24, borderRadius: 10, background: "rgba(42,51,37,0.6)", border: "1px solid rgba(201,185,122,0.15)", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
            <div><label style={labelStyle}>Handicap index</label><input style={inputStyle} type="number" step="0.1" value={form.handicap} onChange={e => setForm({ ...form, handicap: e.target.value })} placeholder="e.g. 12.4" /></div>
            <div><label style={labelStyle}>GHIN number</label><input style={inputStyle} value={form.ghin} onChange={e => setForm({ ...form, ghin: e.target.value })} placeholder="e.g. 1234567" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div><label style={labelStyle}>Intended airport</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={form.airport} onChange={e => setForm({ ...form, airport: e.target.value })}>
                <option value="">Select airport</option>
                {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.city}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Car plans</label><input style={inputStyle} value={form.carPlans} onChange={e => setForm({ ...form, carPlans: e.target.value })} placeholder="Renting, need a ride, driving from Chicago, etc." /></div>
            <div><label style={labelStyle}>Arrival (flight / date / time)</label><input style={inputStyle} value={form.arrival} onChange={e => setForm({ ...form, arrival: e.target.value })} placeholder="e.g. UA 442 — 10/7 @ 3 PM" /></div>
            <div><label style={labelStyle}>Departure (flight / date / time)</label><input style={inputStyle} value={form.departure} onChange={e => setForm({ ...form, departure: e.target.value })} placeholder="e.g. AA 1187 — 10/11 @ 6 PM" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: "#c9b97a", color: "#1c2318", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : editIdx >= 0 ? "Update" : "Save"}</button>
            <button onClick={resetForm} style={{ padding: "10px 24px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading roster...</p>
      ) : participants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No participants yet — be the first to add your info.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 13 }}>
            <thead>
              <tr style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                <th style={{ textAlign: "left", padding: "4px 12px", fontWeight: 500 }}>Name</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>HCP</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>GHIN</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>Airport</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>Arrival</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>Departure</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>Car plans</th>
                <th style={{ padding: "4px 8px", fontWeight: 500 }}></th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.id || i} style={{ background: "rgba(42,51,37,0.35)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#f5f0e4", borderRadius: "6px 0 0 6px" }}>{p.name}</td>
                  <td style={{ padding: "10px 8px", color: p.handicap != null ? "#c9b97a" : "rgba(255,255,255,0.2)" }}>{p.handicap != null ? p.handicap : "\u2014"}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 12 }}>{p.ghin || "\u2014"}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{p.airport || "\u2014"}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.35)", fontSize: 11, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.arrival || "\u2014"}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.35)", fontSize: 11, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.departure || "\u2014"}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.35)", fontSize: 11, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.carPlans || "\u2014"}</td>
                  <td style={{ padding: "10px 8px", borderRadius: "0 6px 6px 0", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, padding: "4px 6px" }}>edit</button>
                    <button onClick={() => handleDelete(i)} disabled={saving} style={{ background: "none", border: "none", color: "rgba(200,100,100,0.5)", cursor: "pointer", fontSize: 11, padding: "4px 6px" }}>x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function HistorySection() {
  return (
    <Section id="History" title="Past Invitationals" subtitle="The champions who have hoisted the trophy">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {PAST_TRIPS.map((t, i) => (
          <div key={i} style={{ padding: 22, borderRadius: 10, background: "rgba(42,51,37,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#c9b97a", fontFamily: "'Playfair Display', Georgia, serif" }}>{t.year}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{t.label}</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(201,185,122,0.5)", marginBottom: 8 }}>Champions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {t.champions.map((name, j) => (
                <span key={j} style={{ fontSize: 12, color: "#f5f0e4", padding: "4px 10px", borderRadius: 4, background: "rgba(201,185,122,0.08)", border: "1px solid rgba(201,185,122,0.1)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {name}
                  <TrophyIcons count={WIN_COUNTS[name]} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── APP ────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("Schedule");
  const handleNav = (item) => { setActive(item); document.getElementById(item)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div style={{ background: "linear-gradient(180deg, #1c2318 0%, #212a1d 50%, #1a2016 100%)", minHeight: "100vh" }}>
      <Hero />
      <Nav active={active} setActive={handleNav} />
      <ScheduleSection />
      <Divider />
      <CoursesSection />
      <Divider />
      <DetailsSection />
      <Divider />
      <TravelSection />
      <Divider />
      <RosterSection />
      <Divider />
      <HistorySection />
      <footer style={{ textAlign: "center", padding: "40px 24px 32px", fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: 2, textTransform: "uppercase" }}>
        16Bussy Invitational — Est. 2023
      </footer>
    </div>
  );
}
