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

const SUPABASE_URL = "YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY_HERE";

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

// Submit a score. Returns true on success, false on failure.
async function submitScore(name, score, total, mode) {
  const client = getSupabase();
  if (!client) return false;
  const trimmed = (name || "").trim().slice(0, 24);
  if (!trimmed) return false;
  try {
    const { error } = await client
      .from("scores")
      .insert([{ name: trimmed, score: score, total: total, mode: mode }]);
    if (error) { console.error("submitScore error:", error); return false; }
    return true;
  } catch (e) {
    console.error("submitScore exception:", e);
    return false;
  }
}

// Fetch leaderboard: best score per name within the time window.
// Returns an array of { name, score, total, mode, created_at } sorted best-first,
// or null on error (so the UI can distinguish "no scores" from "couldn't load").
async function fetchLeaderboard() {
  const client = getSupabase();
  if (!client) return null;
  const sinceIso = new Date(Date.now() - LEADERBOARD_WINDOW_HOURS * 3600 * 1000).toISOString();
  try {
    const { data, error } = await client
      .from("scores")
      .select("name, score, total, mode, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false });
    if (error) { console.error("fetchLeaderboard error:", error); return null; }

    // Reduce to best score per name. "Best" = highest percentage, then highest raw score.
    const bestByName = new Map();
    for (const row of data) {
      const pct = row.total > 0 ? row.score / row.total : 0;
      const existing = bestByName.get(row.name);
      if (!existing) {
        bestByName.set(row.name, { ...row, pct });
      } else if (pct > existing.pct || (pct === existing.pct && row.score > existing.score)) {
        bestByName.set(row.name, { ...row, pct });
      }
    }
    return [...bestByName.values()].sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.score - a.score;
    });
  } catch (e) {
    console.error("fetchLeaderboard exception:", e);
    return null;
  }
}
