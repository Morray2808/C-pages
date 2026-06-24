// ─────────────────────────────────────────────────────────────
//  Supabase configuration
//
//  Replace the two placeholder values below with your own project's
//  values from the Supabase dashboard:
//    Project Settings → API → Project URL          →  SUPABASE_URL
//    Project Settings → API → Project API keys → anon public → SUPABASE_ANON_KEY
//
//  The anon key is SAFE to expose in client-side code, but ONLY because
//  Row Level Security (RLS) is enabled on the scores table with policies
//  that allow nothing beyond public read + insert on that one table.
//  See README for the exact SQL to run.
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://hdlgzapyzcxastndaegv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_snELAGoA8E1uawttuMbR2w_T8MmiD4E";

// How long a score stays on the leaderboard, in hours.
const LEADERBOARD_WINDOW_HOURS = 24;

// Created lazily so pages that don't need the DB don't pay for it.
let _supabaseClient = null;
function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (typeof supabase === "undefined") {
    console.error("Supabase library not loaded.");
    return null;
  }
  if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
    console.warn("Supabase not configured yet — fill in supabase-config.js.");
    return null;
  }
  _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabaseClient;
}

// Submit a score. `quiz` is 'drill' or 'theory'. Returns true on success.
async function submitScore(name, score, total, mode, quiz) {
  const client = getSupabase();
  if (!client) return false;
  const trimmed = (name || "").trim().slice(0, 24);
  if (!trimmed) return false;
  const quizType = quiz === "theory" ? "theory" : "drill";
  try {
    const { error } = await client
      .from("scores")
      .insert([{ name: trimmed, score: score, total: total, mode: mode, quiz: quizType }]);
    if (error) { console.error("submitScore error:", error); return false; }
    return true;
  } catch (e) {
    console.error("submitScore exception:", e);
    return false;
  }
}

// Fetch leaderboard grouped by person, with best drill % and best theory %
// within the time window, plus their average. Returns an array of
// { name, drill, theory, average } sorted by average (best first), where
// drill/theory are percentages (0-100) or null if not attempted.
// Returns null on error so the UI can tell "no scores" from "couldn't load".
async function fetchLeaderboard() {
  const client = getSupabase();
  if (!client) return null;
  const sinceIso = new Date(Date.now() - LEADERBOARD_WINDOW_HOURS * 3600 * 1000).toISOString();
  try {
    const { data, error } = await client
      .from("scores")
      .select("name, score, total, quiz, created_at")
      .gte("created_at", sinceIso);
    if (error) { console.error("fetchLeaderboard error:", error); return null; }

    // For each name, track the best percentage in each quiz type.
    const byName = new Map();
    for (const row of data) {
      const pct = row.total > 0 ? (row.score / row.total) * 100 : 0;
      const quiz = row.quiz === "theory" ? "theory" : "drill";
      if (!byName.has(row.name)) byName.set(row.name, { name: row.name, drill: null, theory: null });
      const entry = byName.get(row.name);
      if (entry[quiz] === null || pct > entry[quiz]) entry[quiz] = pct;
    }

    // Compute the average across whichever types each person has attempted.
    const rows = [...byName.values()].map(e => {
      const parts = [];
      if (e.drill !== null) parts.push(e.drill);
      if (e.theory !== null) parts.push(e.theory);
      const average = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
      return { ...e, average };
    });

    rows.sort((a, b) => b.average - a.average);
    return rows;
  } catch (e) {
    console.error("fetchLeaderboard exception:", e);
    return null;
  }
}
