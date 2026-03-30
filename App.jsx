import { useState, useEffect, useCallback } from "react";

// ─── GOOGLE SHEETS BACKEND ─────────────────────────────────
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || "";
async function fetchRoster() {
  if (!SHEETS_URL) return [];
  try { const r = await fetch(SHEETS_URL); const d = await r.json(); return d.participants || []; } catch { return []; }
}
async function saveToSheet(action, participant) {
  if (!SHEETS_URL) return false;
  try { await fetch(SHEETS_URL, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action, participant }) }); return true; } catch { return false; }
}

// ─── DATA ───────────────────────────────────────────────────

const EVENT_DATE = new Date("2026-10-08T14:00:00-04:00");

const SCHEDULE = [
  { day: "Thursday", date: "Oct 8", course: "Manistee National", firstTee: "2:00 PM", format: "2-Man Scramble", points: 4 },
  { day: "Friday", date: "Oct 9", course: "The South Course", firstTee: "8:31 AM", format: "Alternate Shot", points: 4 },
  { day: "Friday", date: "Oct 9", course: "The Bluffs Course", firstTee: "2:00 PM", format: "High-Low", points: 4 },
  { day: "Saturday", date: "Oct 10", course: "The Bluffs Course", firstTee: "9:00 AM", format: "Best Ball", points: 4 },
  { day: "Saturday", date: "Oct 10", course: "The Dozen", firstTee: "3:30 PM", format: "Scramble", points: 6 },
  { day: "Sunday", date: "Oct 11", course: "The South Course", firstTee: "8:31 AM", format: "Singles Match Play", points: 8 },
];

const COURSES = [
  { name: "The Bluffs Course", rank: "#16 Golf Digest Top 100 Public", tees: ["2:00 PM (Fri)", "9:00 AM (Sat)"], holes: 18, img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=80", desc: "Links-style masterpiece perched 200 feet above Lake Michigan with sweeping views and relentless winds." },
  { name: "The South Course", rank: "#53 Golf Digest Top 100 Public", tees: ["8:31 AM (Fri)", "8:31 AM (Sun)"], holes: 18, img: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80", desc: "Modern design weaving through dunes and native grasses with dramatic elevation changes throughout." },
  { name: "The Dozen", rank: "Unique 12-hole experience", tees: ["3:30 PM (Sat)"], holes: 12, img: "https://images.unsplash.com/photo-1592919505780-303950717480?w=600&q=80", desc: "A 12-hole short course perfect for an afternoon scramble — fun, fast, and competitive." },
  { name: "Manistee National", rank: "Regional favorite", tees: ["2:00 PM (Thurs)"], holes: 18, img: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&q=80", desc: "Scenic woodland course to ease into the week. The warm-up before the real thing begins." },
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

const TEAMS = {
  patricks: { name: "Patrick's Bussies", color: "#c9b97a", members: ["Patrick Browne", "Harrison Martin", "Jason Chang", "Jack Fischer"] },
  eriks: { name: "Erik's Bussies", color: "#7da68a", members: ["Erik Smith", "Charlie Krause", "Jimmy Suszka", "Ace McBee", "Jake Kaufman", "Ethan Axelrad", "Janis Asiris"] },
  freeAgents: { name: "Free agents", color: "rgba(255,255,255,0.4)", members: ["Adam Bieler"], slots: 4 },
};

const STUDS = [
  { name: "Patrick Browne", record: "11-4", pct: "73%" },
  { name: "Jack Fischer", record: "7.5-3.5", pct: "68%" },
  { name: "Jason Chang", record: "7-4", pct: "64%" },
];
const DUDS = [
  { name: "Jake Kaufman", record: "0.5-4.5", pct: "10%" },
  { name: "Moose", record: "3-8", pct: "27%" },
  { name: 'Charlie "Survivor" Krause', record: "2.5-5.5", pct: "31%" },
];

function getWinCounts() {
  const c = {};
  PAST_TRIPS.forEach(t => t.champions.forEach(n => { c[n] = (c[n] || 0) + 1; }));
  return c;
}
const WIN_COUNTS = getWinCounts();

const NAV_ITEMS = ["Schedule", "Courses", "Teams", "Leaderboard", "Details", "Travel", "Stats", "History"];

// ─── HELPERS ────────────────────────────────────────────────

function TrophyIcons({ count }) {
  if (!count) return null;
  return (
    <span style={{ marginLeft: 4 }} title={`${count}x champion`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "-1px", marginLeft: i > 0 ? -1 : 0 }}>
          <path d="M7 4V2h10v2h3a2 2 0 012 2v1c0 2.5-1.5 4.5-3.7 5.3C17.3 16 15 17 13 17.5V20h3v2H8v-2h3v-2.5C9 17 6.7 16 5.7 13.3 3.5 12.5 2 10.5 2 8V6a2 2 0 012-2h3zm-3 4c0 1.3.8 2.5 2 3.2V6H4v2zm16 0V6h-2v5.2c1.2-.7 2-1.9 2-3.2z" fill="#c9b97a"/>
        </svg>
      ))}
    </span>
  );
}

function Section({ id, title, subtitle, children, dark }) {
  return (
    <section id={id} style={{ padding: "48px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 700, color: "#f5f0e4", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 28px" }}>{subtitle}</p>}
      {children}
    </section>
  );
}

function Divider() {
  return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}><div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} /></div>;
}

// ─── COUNTDOWN ──────────────────────────────────────────────

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 70 }}>
      <div style={{ fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(245,240,228,0.4)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ─── MAIN SECTIONS ──────────────────────────────────────────

function Hero() {
  const cd = useCountdown(EVENT_DATE.getTime());
  return (
    <div style={{ background: "linear-gradient(165deg, #1c2318 0%, #2a3325 40%, #1a2016 100%)", padding: "60px 24px 50px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#c9b97a", marginBottom: 12, fontWeight: 500 }}>The 4th Annual</p>
        <h1 style={{ fontFamily: "var(--heading)", fontSize: "clamp(34px, 7vw, 60px)", fontWeight: 700, color: "#f5f0e4", lineHeight: 1.05, margin: "0 0 8px" }}>
          16Bussy Invitational
        </h1>
        <p style={{ fontSize: 15, color: "rgba(245,240,228,0.6)", fontFamily: "var(--heading)", fontStyle: "italic" }}>Arcadia, Michigan — October 8–11, 2026</p>

        {/* Countdown */}
        <div style={{ margin: "32px auto 24px", padding: "24px 16px", background: "rgba(201,185,122,0.04)", borderRadius: 12, border: "1px solid rgba(201,185,122,0.1)", maxWidth: 460 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(201,185,122,0.5)", marginBottom: 16 }}>First tee in</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <CountdownUnit value={cd.days} label="Days" />
            <div style={{ fontSize: 36, color: "rgba(201,185,122,0.2)", fontWeight: 300, lineHeight: 1, paddingTop: 2 }}>:</div>
            <CountdownUnit value={cd.hours} label="Hours" />
            <div style={{ fontSize: 36, color: "rgba(201,185,122,0.2)", fontWeight: 300, lineHeight: 1, paddingTop: 2 }}>:</div>
            <CountdownUnit value={cd.minutes} label="Min" />
            <div style={{ fontSize: 36, color: "rgba(201,185,122,0.2)", fontWeight: 300, lineHeight: 1, paddingTop: 2 }}>:</div>
            <CountdownUnit value={cd.seconds} label="Sec" />
          </div>
        </div>

        <div style={{ padding: "10px 22px", display: "inline-block", background: "rgba(201,185,122,0.06)", borderRadius: 6, border: "1px solid rgba(201,185,122,0.1)" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>15.5 points</span>
          <span style={{ fontSize: 13, color: "rgba(245,240,228,0.5)" }}> to claim </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f5f0e4", fontFamily: "var(--heading)", fontStyle: "italic" }}>the Bussy Jacket</span>
        </div>
      </div>
    </div>
  );
}

function Nav({ active, setActive }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(28,35,24,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
        <span style={{ fontFamily: "var(--heading)", fontSize: 15, color: "#c9b97a", letterSpacing: 1, whiteSpace: "nowrap", padding: "14px 10px 14px 0", borderRight: "1px solid rgba(255,255,255,0.08)", marginRight: 6 }}>16B</span>
        {NAV_ITEMS.map(item => (
          <button key={item} onClick={() => setActive(item)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "14px 10px",
            fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
            color: active === item ? "#c9b97a" : "rgba(255,255,255,0.4)",
            borderBottom: active === item ? "2px solid #c9b97a" : "2px solid transparent",
            transition: "all 0.2s", whiteSpace: "nowrap", fontWeight: 500
          }}>{item}</button>
        ))}
      </div>
    </nav>
  );
}

function ScheduleSection() {
  return (
    <Section id="Schedule" title="Tournament schedule" subtitle="6 rounds across 4 days — 30 total points up for grabs">
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 140px 1fr", gap: 0, padding: "10px 20px", background: "rgba(201,185,122,0.06)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(201,185,122,0.6)", fontWeight: 600 }}>
          <span>Date</span><span>Course</span><span>First tee</span><span>Format</span><span style={{ textAlign: "right" }}>Points per match</span>
        </div>
        {SCHEDULE.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 140px 1fr", gap: 0, padding: "14px 20px", background: i % 2 === 0 ? "rgba(42,51,37,0.5)" : "rgba(36,44,32,0.4)", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f0e4" }}>{r.day}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{r.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f0e4" }}>{r.course}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{r.firstTee}</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, color: "#8b9a6b" }}>{r.format}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a", textAlign: "right", fontFamily: "var(--heading)" }}>{r.points}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CoursesSection() {
  return (
    <Section id="Courses" title="The courses" subtitle="World-class golf on Michigan's Gold Coast">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {COURSES.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr", gap: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(42,51,37,0.4)" }}>
            <div style={{ order: i % 2 === 0 ? 0 : 1, minHeight: 200, background: `url(${c.img}) center/cover`, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(42,51,37,0.9))" }} />
            </div>
            <div style={{ padding: "24px 28px", order: i % 2 === 0 ? 1 : 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f5f0e4", margin: 0, fontFamily: "var(--heading)" }}>{c.name}</h3>
                <span style={{ fontSize: 10, background: "rgba(201,185,122,0.12)", color: "#c9b97a", padding: "2px 8px", borderRadius: 4 }}>{c.holes}H</span>
              </div>
              <p style={{ fontSize: 12, color: "#c9b97a", fontWeight: 600, margin: "0 0 8px" }}>{c.rank}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 14px", lineHeight: 1.6 }}>{c.desc}</p>
              <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Tee times</div>
              {c.tees.map((t, j) => (
                <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{t}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TeamsSection() {
  return (
    <Section id="Teams" title="The teams" subtitle="Confirmed rosters for the 4th Annual Invitational">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[TEAMS.patricks, TEAMS.eriks].map((team, ti) => (
          <div key={ti} style={{ padding: 24, borderRadius: 12, background: "rgba(42,51,37,0.5)", border: `1px solid ${team.color}22` }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: team.color, marginBottom: 12, fontWeight: 600 }}>
              {ti === 0 ? "Defending Champions" : "Challengers"}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: team.color, margin: "0 0 16px", fontFamily: "var(--heading)" }}>{team.name}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {team.members.map((m, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.15)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${team.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: team.color }}>
                    {m.split(" ").map(w => w[0]).join("")}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f5f0e4" }}>{m}</span>
                  <TrophyIcons count={WIN_COUNTS[m]} />
                  {j === 0 && <span style={{ marginLeft: "auto", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: team.color, opacity: 0.6 }}>Captain</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Free Agents */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(42,51,37,0.3)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>Free agents</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TEAMS.freeAgents.members.map((m, j) => (
            <span key={j} style={{ fontSize: 13, color: "#f5f0e4", padding: "6px 14px", borderRadius: 6, background: "rgba(0,0,0,0.15)" }}>{m}</span>
          ))}
          {Array.from({ length: TEAMS.freeAgents.slots }, (_, j) => (
            <span key={`slot-${j}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.1)" }}>Open spot</span>
          ))}
        </div>
      </div>

      {/* Draft Info */}
      <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(201,185,122,0.06)", border: "1px solid rgba(201,185,122,0.12)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(201,185,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#c9b97a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#c9b97a" }}>The draft</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginTop: 2 }}>
            This year's draft will be virtual due to scheduling concerns — details to come.
          </div>
        </div>
      </div>
    </Section>
  );
}

function LeaderboardSection() {
  return (
    <Section id="Leaderboard" title="Live leaderboard" subtitle="Updated after each round — track the race for the Bussy Jacket">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Patrick's team */}
        <div style={{ padding: 24, borderRadius: 12, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(201,185,122,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(201,185,122,0.5)", marginBottom: 8 }}>Defending</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)", marginBottom: 16 }}>Patrick's Bussies</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)", lineHeight: 1 }}>0</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>points</div>
          <div style={{ marginTop: 16, padding: "8px 14px", borderRadius: 6, background: "rgba(201,185,122,0.06)", fontSize: 12, color: "rgba(201,185,122,0.6)" }}>
            Need <strong style={{ color: "#c9b97a" }}>15 points</strong> to retain the jacket
          </div>
        </div>
        {/* Erik's team */}
        <div style={{ padding: 24, borderRadius: 12, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(125,166,138,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(125,166,138,0.5)", marginBottom: 8 }}>Challenger</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#7da68a", fontFamily: "var(--heading)", marginBottom: 16 }}>Erik's Bussies</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#7da68a", fontFamily: "var(--heading)", lineHeight: 1 }}>0</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>points</div>
          <div style={{ marginTop: 16, padding: "8px 14px", borderRadius: 6, background: "rgba(125,166,138,0.06)", fontSize: 12, color: "rgba(125,166,138,0.6)" }}>
            Need <strong style={{ color: "#7da68a" }}>15.5 points</strong> to claim the jacket
          </div>
        </div>
      </div>

      {/* Round-by-round (empty for now) */}
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 0, padding: "10px 20px", background: "rgba(201,185,122,0.06)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(201,185,122,0.6)", fontWeight: 600 }}>
          <span>Round</span><span style={{ textAlign: "center" }}>PB</span><span style={{ textAlign: "center" }}>EB</span>
        </div>
        {SCHEDULE.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 0, padding: "12px 20px", background: i % 2 === 0 ? "rgba(42,51,37,0.5)" : "rgba(36,44,32,0.4)", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 13, color: "#f5f0e4", fontWeight: 500 }}>{r.format}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>{r.day}</span>
            </div>
            <div style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.15)" }}>—</div>
            <div style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.15)" }}>—</div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 0, padding: "14px 20px", background: "rgba(201,185,122,0.06)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c9b97a" }}>Total</span>
          <span style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>0</span>
          <span style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#7da68a", fontFamily: "var(--heading)" }}>0</span>
        </div>
      </div>

      {/* Squabbit plug */}
      <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 10, background: "rgba(42,51,37,0.4)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #4a7c59 0%, #2d5a3e 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 19c-4.3 1.4-4.3-2.3-6-3l18 0M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="#fff" opacity="0.5"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f0e4" }}>Live scoring via Squabbit</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginTop: 2 }}>
            We use Squabbit for real-time scoring during the tournament. Download the app to follow along and enter scores live.
          </div>
        </div>
        <a href="https://apps.apple.com/app/squabbit-golf" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "#f5f0e4", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>Get the app</a>
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
          {[{ item: "Lodging", detail: "Full breakfast included", cost: "$650" }, { item: "Golf", detail: "6 rounds", cost: "$825" }].map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div><span style={{ fontSize: 14, color: "#f5f0e4" }}>{p.item}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>{p.detail}</span></div>
              <span style={{ fontSize: 14, color: "#f5f0e4", fontFamily: "var(--heading)" }}>{p.cost}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderTop: "1px solid rgba(201,185,122,0.15)", marginTop: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a" }}>Total per person</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>$1,475</span>
          </div>
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 6, background: "rgba(201,185,122,0.08)", border: "1px solid rgba(201,185,122,0.12)", fontSize: 12, color: "#c9b97a", lineHeight: 1.6 }}>
            $216 deposit already collected — remaining balance of <strong style={{ color: "#f5f0e4" }}>$1,259</strong> due before the trip.
          </div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#c9b97a", margin: "0 0 16px", fontWeight: 500 }}>Lodging</h3>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e4", margin: "0 0 6px", fontFamily: "var(--heading)" }}>Arcadia Bluffs Cottages</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 18px", lineHeight: 1.6 }}>Two private cottages on the resort grounds, walking distance to the first tee.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["2", "Cottages"], ["16", "Beds total"], ["8", "Bathrooms"], ["\u2713", "Free breakfast"]].map(([n, l]) => (
              <div key={l} style={{ padding: "12px", borderRadius: 6, background: "rgba(0,0,0,0.15)", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>{n}</div>
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
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
              <div style={{ height: "100%", width: `${a.pct * 100}%`, borderRadius: 3, background: i === 0 ? "#c9b97a" : "rgba(139,154,107,0.5)" }} />
            </div>
            <span style={{ fontSize: 13, color: i === 0 ? "#c9b97a" : "rgba(255,255,255,0.5)", textAlign: "right", fontWeight: i === 0 ? 600 : 400 }}>{a.drive}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 18px", borderRadius: 8, background: "rgba(201,185,122,0.06)", border: "1px solid rgba(201,185,122,0.12)", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
        <span style={{ color: "#c9b97a", fontWeight: 600 }}>Chicago crew:</span> Multiple cars will be leaving from the Chicago area. Coordinate rides in the roster below.
      </div>
    </Section>
  );
}

function StatsSection() {
  return (
    <Section id="Stats" title="All-time stats" subtitle="Records and legends from across the 16Bussy Invitational history">
      {/* Aces */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(201,185,122,0.04)", border: "1px solid rgba(201,185,122,0.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#c9b97a" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="#c9b97a" strokeWidth="1"/><circle cx="12" cy="12" r="1.5" fill="#c9b97a"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(201,185,122,0.5)" }}>Hole-in-one club</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>Austin McBee</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8, paddingLeft: 38 }}>
          Hole 15, Wolf Creek — 3rd Annual 16Bussy Invitational
        </div>
      </div>

      {/* Studs & Duds */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Studs */}
        <div style={{ padding: 22, borderRadius: 12, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(201,185,122,0.1)" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#c9b97a", marginBottom: 14, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "-2px", marginRight: 6 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#c9b97a"/></svg>
            Bussy studs
          </div>
          {STUDS.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f0e4" }}>{s.name}</span>
                <TrophyIcons count={WIN_COUNTS[s.name]} />
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>{s.pct}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>{s.record}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Duds */}
        <div style={{ padding: 22, borderRadius: 12, background: "rgba(42,51,37,0.5)", border: "1px solid rgba(200,100,100,0.08)" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(200,120,120,0.7)", marginBottom: 14, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "-2px", marginRight: 6 }}><path d="M12 22l-3.09-6.26L2 14.73l5-4.87L5.82 3l6.18 3.25L18.18 3 17 9.86l5 4.87-6.91 1.01L12 22z" fill="rgba(200,120,120,0.7)"/></svg>
            Bussy duds
          </div>
          {DUDS.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f0e4" }}>{s.name}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(200,120,120,0.7)", fontFamily: "var(--heading)" }}>{s.pct}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>{s.record}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
              <div style={{ fontSize: 28, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)" }}>{t.year}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{t.label}</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(201,185,122,0.5)", marginBottom: 6 }}>Champions</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c9b97a", fontFamily: "var(--heading)", marginBottom: 10 }}>Patrick's Bussies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {t.champions.map((name, j) => (
                <span key={j} style={{ fontSize: 12, color: "#f5f0e4", padding: "4px 10px", borderRadius: 4, background: "rgba(201,185,122,0.08)", border: "1px solid rgba(201,185,122,0.1)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {name}<TrophyIcons count={WIN_COUNTS[name]} />
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
    <div style={{ "--heading": "'Playfair Display', Georgia, serif", background: "linear-gradient(180deg, #1c2318 0%, #212a1d 50%, #1a2016 100%)", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#f5f0e4" }}>
      <Hero />
      <Nav active={active} setActive={handleNav} />
      <ScheduleSection />
      <Divider />
      <CoursesSection />
      <Divider />
      <TeamsSection />
      <Divider />
      <LeaderboardSection />
      <Divider />
      <DetailsSection />
      <Divider />
      <TravelSection />
      <Divider />
      <StatsSection />
      <Divider />
      <HistorySection />
      <footer style={{ textAlign: "center", padding: "40px 24px 32px", fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: 2, textTransform: "uppercase" }}>
        16Bussy Invitational — Est. 2023
      </footer>
    </div>
  );
}
