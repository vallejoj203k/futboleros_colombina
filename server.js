'use strict';
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ─────────────────────────────────────────────
   DATABASE INIT + SEED
───────────────────────────────────────────── */
const MATCHES_SEED = [
  // GRUPO A
  { id:1,  group:'A', home:'México',               away:'Sudáfrica',           home_cls:'flag-MEX', away_cls:'flag-RSA', match_date:'Jun 11', match_time:'2:00 PM' },
  { id:2,  group:'A', home:'Corea del Sur',         away:'Chequia',             home_cls:'flag-KOR', away_cls:'flag-CZE', match_date:'Jun 11', match_time:'9:00 PM' },
  { id:3,  group:'A', home:'Chequia',               away:'Sudáfrica',           home_cls:'flag-CZE', away_cls:'flag-RSA', match_date:'Jun 18', match_time:'11:00 AM' },
  { id:4,  group:'A', home:'México',                away:'Corea del Sur',       home_cls:'flag-MEX', away_cls:'flag-KOR', match_date:'Jun 18', match_time:'8:00 PM' },
  { id:5,  group:'A', home:'Chequia',               away:'México',              home_cls:'flag-CZE', away_cls:'flag-MEX', match_date:'Jun 24', match_time:'8:00 PM' },
  { id:6,  group:'A', home:'Sudáfrica',             away:'Corea del Sur',       home_cls:'flag-RSA', away_cls:'flag-KOR', match_date:'Jun 24', match_time:'8:00 PM' },
  // GRUPO B
  { id:7,  group:'B', home:'Canadá',               away:'Bosnia y Herzegovina', home_cls:'flag-CAN', away_cls:'flag-BIH', match_date:'Jun 12', match_time:'2:00 PM' },
  { id:8,  group:'B', home:'Catar',                 away:'Suiza',               home_cls:'flag-QAT', away_cls:'flag-SUI', match_date:'Jun 13', match_time:'2:00 PM' },
  { id:9,  group:'B', home:'Suiza',                 away:'Bosnia y Herzegovina', home_cls:'flag-SUI', away_cls:'flag-BIH', match_date:'Jun 18', match_time:'2:00 PM' },
  { id:10, group:'B', home:'Canadá',               away:'Catar',               home_cls:'flag-CAN', away_cls:'flag-QAT', match_date:'Jun 18', match_time:'5:00 PM' },
  { id:11, group:'B', home:'Suiza',                 away:'Canadá',              home_cls:'flag-SUI', away_cls:'flag-CAN', match_date:'Jun 24', match_time:'2:00 PM' },
  { id:12, group:'B', home:'Bosnia y Herzegovina', away:'Catar',               home_cls:'flag-BIH', away_cls:'flag-QAT', match_date:'Jun 24', match_time:'2:00 PM' },
  // GRUPO C
  { id:13, group:'C', home:'Brasil',               away:'Marruecos',            home_cls:'flag-BRA', away_cls:'flag-MAR', match_date:'Jun 13', match_time:'5:00 PM' },
  { id:14, group:'C', home:'Haití',                away:'Escocia',              home_cls:'flag-HAI', away_cls:'flag-SCO', match_date:'Jun 13', match_time:'8:00 PM' },
  { id:15, group:'C', home:'Escocia',              away:'Marruecos',            home_cls:'flag-SCO', away_cls:'flag-MAR', match_date:'Jun 19', match_time:'5:00 PM' },
  { id:16, group:'C', home:'Brasil',               away:'Haití',               home_cls:'flag-BRA', away_cls:'flag-HAI', match_date:'Jun 19', match_time:'7:30 PM' },
  { id:17, group:'C', home:'Escocia',              away:'Brasil',              home_cls:'flag-SCO', away_cls:'flag-BRA', match_date:'Jun 24', match_time:'5:00 PM' },
  { id:18, group:'C', home:'Marruecos',            away:'Haití',               home_cls:'flag-MAR', away_cls:'flag-HAI', match_date:'Jun 24', match_time:'5:00 PM' },
  // GRUPO D
  { id:19, group:'D', home:'Estados Unidos',       away:'Paraguay',            home_cls:'flag-USA', away_cls:'flag-PAR', match_date:'Jun 12', match_time:'8:00 PM' },
  { id:20, group:'D', home:'Australia',            away:'Turquía',             home_cls:'flag-AUS', away_cls:'flag-TUR', match_date:'Jun 13', match_time:'11:00 PM' },
  { id:21, group:'D', home:'Estados Unidos',       away:'Australia',           home_cls:'flag-USA', away_cls:'flag-AUS', match_date:'Jun 19', match_time:'2:00 PM' },
  { id:22, group:'D', home:'Turquía',              away:'Paraguay',            home_cls:'flag-TUR', away_cls:'flag-PAR', match_date:'Jun 19', match_time:'8:00 PM' },
  { id:23, group:'D', home:'Turquía',              away:'Estados Unidos',      home_cls:'flag-TUR', away_cls:'flag-USA', match_date:'Jun 25', match_time:'9:00 PM' },
  { id:24, group:'D', home:'Paraguay',             away:'Australia',           home_cls:'flag-PAR', away_cls:'flag-AUS', match_date:'Jun 25', match_time:'9:00 PM' },
  // GRUPO E
  { id:25, group:'E', home:'Alemania',             away:'Curazao',             home_cls:'flag-GER', away_cls:'flag-CUW', match_date:'Jun 14', match_time:'12:00 PM' },
  { id:26, group:'E', home:'Costa de Marfil',      away:'Ecuador',             home_cls:'flag-CIV', away_cls:'flag-ECU', match_date:'Jun 14', match_time:'6:00 PM' },
  { id:27, group:'E', home:'Alemania',             away:'Costa de Marfil',     home_cls:'flag-GER', away_cls:'flag-CIV', match_date:'Jun 20', match_time:'3:00 PM' },
  { id:28, group:'E', home:'Ecuador',              away:'Curazao',             home_cls:'flag-ECU', away_cls:'flag-CUW', match_date:'Jun 20', match_time:'7:00 PM' },
  { id:29, group:'E', home:'Curazao',              away:'Costa de Marfil',     home_cls:'flag-CUW', away_cls:'flag-CIV', match_date:'Jun 25', match_time:'3:00 PM' },
  { id:30, group:'E', home:'Ecuador',              away:'Alemania',            home_cls:'flag-ECU', away_cls:'flag-GER', match_date:'Jun 25', match_time:'3:00 PM' },
  // GRUPO F
  { id:31, group:'F', home:'Países Bajos',         away:'Japón',               home_cls:'flag-NED', away_cls:'flag-JPN', match_date:'Jun 14', match_time:'3:00 PM' },
  { id:32, group:'F', home:'Suecia',               away:'Túnez',               home_cls:'flag-SWE', away_cls:'flag-TUN', match_date:'Jun 14', match_time:'9:00 PM' },
  { id:33, group:'F', home:'Túnez',                away:'Japón',               home_cls:'flag-TUN', away_cls:'flag-JPN', match_date:'Jun 19', match_time:'11:00 PM' },
  { id:34, group:'F', home:'Países Bajos',         away:'Suecia',              home_cls:'flag-NED', away_cls:'flag-SWE', match_date:'Jun 20', match_time:'12:00 PM' },
  { id:35, group:'F', home:'Japón',                away:'Suecia',              home_cls:'flag-JPN', away_cls:'flag-SWE', match_date:'Jun 25', match_time:'6:00 PM' },
  { id:36, group:'F', home:'Túnez',                away:'Países Bajos',        home_cls:'flag-TUN', away_cls:'flag-NED', match_date:'Jun 25', match_time:'6:00 PM' },
  // GRUPO G
  { id:37, group:'G', home:'Bélgica',              away:'Egipto',              home_cls:'flag-BEL', away_cls:'flag-EGY', match_date:'Jun 15', match_time:'2:00 PM' },
  { id:38, group:'G', home:'Irán',                 away:'Nueva Zelanda',       home_cls:'flag-IRN', away_cls:'flag-NZL', match_date:'Jun 15', match_time:'8:00 PM' },
  { id:39, group:'G', home:'Bélgica',              away:'Irán',                home_cls:'flag-BEL', away_cls:'flag-IRN', match_date:'Jun 21', match_time:'2:00 PM' },
  { id:40, group:'G', home:'Nueva Zelanda',        away:'Egipto',              home_cls:'flag-NZL', away_cls:'flag-EGY', match_date:'Jun 21', match_time:'8:00 PM' },
  { id:41, group:'G', home:'Egipto',               away:'Irán',                home_cls:'flag-EGY', away_cls:'flag-IRN', match_date:'Jun 26', match_time:'10:00 PM' },
  { id:42, group:'G', home:'Nueva Zelanda',        away:'Bélgica',             home_cls:'flag-NZL', away_cls:'flag-BEL', match_date:'Jun 26', match_time:'10:00 PM' },
  // GRUPO H
  { id:43, group:'H', home:'España',               away:'Cabo Verde',          home_cls:'flag-ESP', away_cls:'flag-CPV', match_date:'Jun 15', match_time:'11:00 AM' },
  { id:44, group:'H', home:'Arabia Saudí',         away:'Uruguay',             home_cls:'flag-KSA', away_cls:'flag-URY', match_date:'Jun 15', match_time:'5:00 PM' },
  { id:45, group:'H', home:'España',               away:'Arabia Saudí',        home_cls:'flag-ESP', away_cls:'flag-KSA', match_date:'Jun 21', match_time:'11:00 AM' },
  { id:46, group:'H', home:'Uruguay',              away:'Cabo Verde',          home_cls:'flag-URY', away_cls:'flag-CPV', match_date:'Jun 21', match_time:'5:00 PM' },
  { id:47, group:'H', home:'Cabo Verde',           away:'Arabia Saudí',        home_cls:'flag-CPV', away_cls:'flag-KSA', match_date:'Jun 26', match_time:'7:00 PM' },
  { id:48, group:'H', home:'Uruguay',              away:'España',              home_cls:'flag-URY', away_cls:'flag-ESP', match_date:'Jun 26', match_time:'7:00 PM' },
  // GRUPO I
  { id:49, group:'I', home:'Francia',              away:'Senegal',             home_cls:'flag-FRA', away_cls:'flag-SEN', match_date:'Jun 16', match_time:'2:00 PM' },
  { id:50, group:'I', home:'Irak',                 away:'Noruega',             home_cls:'flag-IRQ', away_cls:'flag-NOR', match_date:'Jun 16', match_time:'5:00 PM' },
  { id:51, group:'I', home:'Francia',              away:'Irak',                home_cls:'flag-FRA', away_cls:'flag-IRQ', match_date:'Jun 22', match_time:'4:00 PM' },
  { id:52, group:'I', home:'Noruega',              away:'Senegal',             home_cls:'flag-NOR', away_cls:'flag-SEN', match_date:'Jun 22', match_time:'7:00 PM' },
  { id:53, group:'I', home:'Noruega',              away:'Francia',             home_cls:'flag-NOR', away_cls:'flag-FRA', match_date:'Jun 26', match_time:'2:00 PM' },
  { id:54, group:'I', home:'Senegal',              away:'Irak',                home_cls:'flag-SEN', away_cls:'flag-IRQ', match_date:'Jun 26', match_time:'2:00 PM' },
  // GRUPO J
  { id:55, group:'J', home:'Argentina',            away:'Argelia',             home_cls:'flag-ARG', away_cls:'flag-ALG', match_date:'Jun 16', match_time:'8:00 PM' },
  { id:56, group:'J', home:'Austria',              away:'Jordania',            home_cls:'flag-AUT', away_cls:'flag-JOR', match_date:'Jun 16', match_time:'11:00 PM' },
  { id:57, group:'J', home:'Argentina',            away:'Austria',             home_cls:'flag-ARG', away_cls:'flag-AUT', match_date:'Jun 22', match_time:'12:00 PM' },
  { id:58, group:'J', home:'Jordania',             away:'Argelia',             home_cls:'flag-JOR', away_cls:'flag-ALG', match_date:'Jun 22', match_time:'10:00 PM' },
  { id:59, group:'J', home:'Jordania',             away:'Argentina',           home_cls:'flag-JOR', away_cls:'flag-ARG', match_date:'Jun 27', match_time:'9:00 PM' },
  { id:60, group:'J', home:'Argelia',              away:'Austria',             home_cls:'flag-ALG', away_cls:'flag-AUT', match_date:'Jun 27', match_time:'9:00 PM' },
  // GRUPO K
  { id:61, group:'K', home:'Portugal',             away:'DR Congo',            home_cls:'flag-POR', away_cls:'flag-COD', match_date:'Jun 17', match_time:'12:00 PM' },
  { id:62, group:'K', home:'Uzbekistán',           away:'Colombia',            home_cls:'flag-UZB', away_cls:'flag-COL', match_date:'Jun 17', match_time:'9:00 PM' },
  { id:63, group:'K', home:'Portugal',             away:'Uzbekistán',          home_cls:'flag-POR', away_cls:'flag-UZB', match_date:'Jun 23', match_time:'12:00 PM' },
  { id:64, group:'K', home:'Colombia',             away:'DR Congo',            home_cls:'flag-COL', away_cls:'flag-COD', match_date:'Jun 23', match_time:'9:00 PM' },
  { id:65, group:'K', home:'Colombia',             away:'Portugal',            home_cls:'flag-COL', away_cls:'flag-POR', match_date:'Jun 27', match_time:'6:30 PM' },
  { id:66, group:'K', home:'DR Congo',             away:'Uzbekistán',          home_cls:'flag-COD', away_cls:'flag-UZB', match_date:'Jun 27', match_time:'6:30 PM' },
  // GRUPO L
  { id:67, group:'L', home:'Inglaterra',           away:'Croacia',             home_cls:'flag-ENG', away_cls:'flag-CRO', match_date:'Jun 17', match_time:'3:00 PM' },
  { id:68, group:'L', home:'Ghana',                away:'Panamá',              home_cls:'flag-GHA', away_cls:'flag-PAN', match_date:'Jun 17', match_time:'6:00 PM' },
  { id:69, group:'L', home:'Inglaterra',           away:'Ghana',               home_cls:'flag-ENG', away_cls:'flag-GHA', match_date:'Jun 23', match_time:'3:00 PM' },
  { id:70, group:'L', home:'Panamá',               away:'Croacia',             home_cls:'flag-PAN', away_cls:'flag-CRO', match_date:'Jun 23', match_time:'6:00 PM' },
  { id:71, group:'L', home:'Panamá',               away:'Inglaterra',          home_cls:'flag-PAN', away_cls:'flag-ENG', match_date:'Jun 27', match_time:'4:00 PM' },
  { id:72, group:'L', home:'Croacia',              away:'Ghana',               home_cls:'flag-CRO', away_cls:'flag-GHA', match_date:'Jun 27', match_time:'4:00 PM' }
];

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id      SERIAL PRIMARY KEY,
        nombre  VARCHAR(100) NOT NULL,
        cedula  VARCHAR(20)  UNIQUE,
        estado  VARCHAR(20)  NOT NULL DEFAULT 'Activo',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id          INTEGER PRIMARY KEY,
        grp         VARCHAR(2)  NOT NULL,
        home        VARCHAR(60) NOT NULL,
        away        VARCHAR(60) NOT NULL,
        home_cls    VARCHAR(20) NOT NULL,
        away_cls    VARCHAR(20) NOT NULL,
        match_date  VARCHAR(20) NOT NULL,
        match_time  VARCHAR(20) NOT NULL,
        status      VARCHAR(20) NOT NULL DEFAULT 'abierto',
        home_real   INTEGER,
        away_real   INTEGER
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id    INTEGER NOT NULL REFERENCES matches(id),
        home_pred   INTEGER,
        away_pred   INTEGER,
        result_pred VARCHAR(1),
        updated_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, match_id)
      );

      CREATE TABLE IF NOT EXISTS knockout_matches (
        id          SERIAL PRIMARY KEY,
        round       VARCHAR(5)  NOT NULL,
        match_num   INTEGER     NOT NULL,
        home        VARCHAR(60),
        away        VARCHAR(60),
        match_date  VARCHAR(20),
        match_time  VARCHAR(20),
        home_score  INTEGER,
        away_score  INTEGER,
        home_pens   INTEGER,
        away_pens   INTEGER,
        status      VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        UNIQUE(round, match_num)
      );
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM matches');
    if (parseInt(rows[0].count, 10) === 0) {
      for (const m of MATCHES_SEED) {
        await client.query(
          `INSERT INTO matches (id,grp,home,away,home_cls,away_cls,match_date,match_time)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
          [m.id, m.group, m.home, m.away, m.home_cls, m.away_cls, m.match_date, m.match_time]
        );
      }
      console.log('Seeded 72 matches');
    }

    // Make cedula nullable in case table was created with NOT NULL
    await client.query(`ALTER TABLE users ALTER COLUMN cedula DROP NOT NULL`).catch(() => {});

    // Seed knockout slots
    const KNOCKOUT_SLOTS = [
      ...Array.from({length:16}, (_,i) => ['R32', i+1]),
      ...Array.from({length:8},  (_,i) => ['R16', i+1]),
      ...Array.from({length:4},  (_,i) => ['QF',  i+1]),
      ...Array.from({length:2},  (_,i) => ['SF',  i+1]),
      ['3P', 1], ['F', 1]
    ];
    for (const [round, num] of KNOCKOUT_SLOTS) {
      await client.query(
        `INSERT INTO knockout_matches (round, match_num) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [round, num]
      );
    }
  } finally {
    client.release();
  }
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function calcPoints(p, m) {
  if (m.home_real === null || m.away_real === null) return 0;
  const realRes = m.home_real > m.away_real ? '1' : (m.home_real < m.away_real ? '2' : 'X');
  if (p.home_pred !== null && p.away_pred !== null) {
    if (p.home_pred === m.home_real && p.away_pred === m.away_real) return 10;
    const predRes = p.home_pred > p.away_pred ? '1' : (p.home_pred < p.away_pred ? '2' : 'X');
    return predRes === realRes ? 3 : 0;
  }
  if (p.result_pred) return p.result_pred === realRes ? 3 : 0;
  return 0;
}

// Parse "Jun 11" + "2:00 PM" → UTC Date (matches are in COT = UTC-5)
const MONTH_IDX = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function parseMatchUTC(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [mon, day] = dateStr.trim().split(' ');
  const [hhmm, ampm] = timeStr.trim().split(' ');
  let [h, m] = hhmm.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  // COT = UTC-5 → add 5 hours to get UTC
  return new Date(Date.UTC(2026, MONTH_IDX[mon] ?? 5, parseInt(day), h + 5, m));
}

/* ─────────────────────────────────────────────
   AUTO-CLOSE MATCHES (runs every 60 s)
───────────────────────────────────────────── */
async function autoCloseMatches() {
  try {
    const { rows } = await pool.query(
      "SELECT id, match_date, match_time FROM matches WHERE status = 'abierto'"
    );
    const now = Date.now();
    for (const m of rows) {
      const t = parseMatchUTC(m.match_date, m.match_time);
      if (t && now >= t.getTime()) {
        await pool.query("UPDATE matches SET status = 'cerrado' WHERE id = $1", [m.id]);
        console.log(`Auto-closed match ${m.id} (${m.match_date} ${m.match_time} COT)`);
      }
    }
  } catch (e) {
    console.error('autoCloseMatches error:', e.message);
  }
}

/* ─────────────────────────────────────────────
   AUTH
───────────────────────────────────────────── */
app.post('/api/auth/login', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim().length < 3) return res.status(400).json({ error: 'Nombre requerido (mínimo 3 caracteres)' });
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, cedula, estado FROM users WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );
    if (!rows.length) return res.status(404).json({ error: 'Nombre no registrado. Contacta al administrador.' });
    if (rows.length > 1) return res.status(409).json({ error: 'Nombre duplicado en el sistema. Contacta al administrador.' });
    if (rows[0].estado !== 'Activo') return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────────────────────
   MATCHES
───────────────────────────────────────────── */
app.get('/api/matches', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, grp as "group", home, away, home_cls as "homeCls", away_cls as "awayCls", match_date as date, match_time as time, status, home_real as "homeReal", away_real as "awayReal" FROM matches ORDER BY id'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────────────────────
   PREDICTIONS
───────────────────────────────────────────── */
app.get('/api/predictions', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });
  try {
    const { rows } = await pool.query(
      `SELECT match_id as "matchId", home_pred as "homePred", away_pred as "awayPred", result_pred as "resultPred"
       FROM predictions WHERE user_id = $1`,
      [userId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/predictions', async (req, res) => {
  const { userId, matchId, homePred, awayPred, resultPred } = req.body;
  if (!userId || !matchId) return res.status(400).json({ error: 'userId y matchId requeridos' });

  // Verify match is still open
  const mRes = await pool.query('SELECT status FROM matches WHERE id = $1', [matchId]);
  if (!mRes.rows.length || mRes.rows[0].status !== 'abierto') {
    return res.status(400).json({ error: 'El partido ya no acepta predicciones' });
  }

  try {
    await pool.query(
      `INSERT INTO predictions (user_id, match_id, home_pred, away_pred, result_pred, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, match_id) DO UPDATE
         SET home_pred = EXCLUDED.home_pred,
             away_pred = EXCLUDED.away_pred,
             result_pred = EXCLUDED.result_pred,
             updated_at = NOW()`,
      [userId, matchId, homePred ?? null, awayPred ?? null, resultPred ?? null]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────────── */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows: users } = await pool.query(
      `SELECT u.id, u.nombre FROM users u WHERE u.estado = 'Activo' ORDER BY u.nombre`
    );
    const { rows: preds } = await pool.query(
      `SELECT p.user_id, p.match_id, p.home_pred, p.away_pred, p.result_pred,
              m.home_real, m.away_real, m.status
       FROM predictions p
       JOIN matches m ON m.id = p.match_id`
    );

    const board = users.map(function(u) {
      const userPreds = preds.filter(function(p) { return p.user_id === u.id; });
      let pts = 0, exactas = 0, resultados = 0;
      userPreds.forEach(function(p) {
        const m = { home_real: p.home_real, away_real: p.away_real };
        const pts_m = calcPoints({ home_pred: p.home_pred, away_pred: p.away_pred, result_pred: p.result_pred }, m);
        pts += pts_m;
        if (pts_m === 10) exactas++;
        else if (pts_m === 3) resultados++;
      });
      const ini = u.nombre.trim().split(/\s+/).reduce(function(acc, w, i, arr) {
        return i === 0 || i === arr.length - 1 ? acc + w[0].toUpperCase() : acc;
      }, '');
      return { id: u.id, name: u.nombre, ini, pts, aciertos: exactas + resultados };
    });

    board.sort(function(a, b) { return b.pts - a.pts || a.name.localeCompare(b.name); });
    board.forEach(function(r, i) { r.rank = i + 1; });
    res.json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN — USERS CRUD
───────────────────────────────────────────── */
app.get('/api/admin/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, cedula, estado FROM users ORDER BY id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/users', async (req, res) => {
  const { nombre, cedula, estado } = req.body;
  if (!nombre || nombre.trim().length < 3) return res.status(400).json({ error: 'Nombre requerido' });
  const cedFinal = cedula ? cedula.trim() : null;
  try {
    // Check duplicate name
    const dup = await pool.query('SELECT id FROM users WHERE LOWER(nombre) = LOWER($1)', [nombre.trim()]);
    if (dup.rows.length) return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    const { rows } = await pool.query(
      'INSERT INTO users (nombre, cedula, estado) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), cedFinal, estado || 'Activo']
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Ese nombre o cédula ya está registrado' });
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const { nombre, cedula, estado } = req.body;
  try {
    // Check duplicate name excluding self
    const dup = await pool.query(
      'SELECT id FROM users WHERE LOWER(nombre) = LOWER($1) AND id <> $2',
      [nombre, req.params.id]
    );
    if (dup.rows.length) return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    const { rows } = await pool.query(
      'UPDATE users SET nombre=$1, cedula=$2, estado=$3 WHERE id=$4 RETURNING *',
      [nombre, cedula || null, estado, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Esa cédula ya está registrada' });
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────
   ADMIN — STATS
───────────────────────────────────────────── */
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [uRes, pRes, mRes, ptRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE estado = 'Activo'"),
      pool.query("SELECT COUNT(*) FROM predictions"),
      pool.query("SELECT COUNT(*) FROM matches WHERE status = 'abierto'"),
      pool.query(`
        SELECT COALESCE(SUM(
          CASE
            WHEN p.home_pred IS NOT NULL AND m.home_real IS NOT NULL THEN
              CASE WHEN p.home_pred = m.home_real AND p.away_pred = m.away_real THEN 10
                   WHEN SIGN(p.home_pred - p.away_pred) = SIGN(m.home_real - m.away_real) THEN 3
                   ELSE 0 END
            WHEN p.result_pred IS NOT NULL AND m.home_real IS NOT NULL THEN
              CASE WHEN p.result_pred = CASE WHEN m.home_real > m.away_real THEN '1'
                                             WHEN m.home_real < m.away_real THEN '2' ELSE 'X' END THEN 3
                   ELSE 0 END
            ELSE 0
          END
        ), 0) AS total_pts
        FROM predictions p JOIN matches m ON m.id = p.match_id
      `)
    ]);
    res.json({
      members:      parseInt(uRes.rows[0].count),
      predictions:  parseInt(pRes.rows[0].count),
      activeMatches:parseInt(mRes.rows[0].count),
      totalPts:     parseInt(ptRes.rows[0].total_pts)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────
   ADMIN — PREDICTIONS VIEWER
───────────────────────────────────────────── */
app.get('/api/admin/predictions', async (req, res) => {
  const { matchId } = req.query;
  try {
    let query, params;
    if (matchId) {
      query = `
        SELECT u.nombre, p.home_pred, p.away_pred, p.result_pred,
               m.home_real, m.away_real, m.home, m.away, m.status
        FROM predictions p
        JOIN users u ON u.id = p.user_id
        JOIN matches m ON m.id = p.match_id
        WHERE p.match_id = $1
        ORDER BY u.nombre`;
      params = [matchId];
    } else {
      query = `
        SELECT u.nombre, m.id as match_id, m.home, m.away, m.match_date,
               p.home_pred, p.away_pred, p.result_pred,
               m.home_real, m.away_real, m.status
        FROM predictions p
        JOIN users u ON u.id = p.user_id
        JOIN matches m ON m.id = p.match_id
        ORDER BY m.id, u.nombre`;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────
   ADMIN — MATCH MANAGEMENT
───────────────────────────────────────────── */
app.put('/api/admin/matches/:id', async (req, res) => {
  const { status, homeReal, awayReal } = req.body;
  const fields = [];
  const vals = [];
  let idx = 1;
  if (status !== undefined)  { fields.push(`status=$${idx++}`);    vals.push(status); }
  if (homeReal !== undefined) { fields.push(`home_real=$${idx++}`); vals.push(homeReal); }
  if (awayReal !== undefined) { fields.push(`away_real=$${idx++}`); vals.push(awayReal); }
  if (!fields.length) return res.status(400).json({ error: 'Nada que actualizar' });
  vals.push(req.params.id);
  try {
    await pool.query(`UPDATE matches SET ${fields.join(',')} WHERE id=$${idx}`, vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────
   KNOCKOUT BRACKET
───────────────────────────────────────────── */
app.get('/api/knockout', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, round, match_num as "matchNum", home, away,
              match_date as date, match_time as time,
              home_score as "homeScore", away_score as "awayScore",
              home_pens as "homePens", away_pens as "awayPens", status
       FROM knockout_matches ORDER BY
         CASE round WHEN 'R32' THEN 1 WHEN 'R16' THEN 2 WHEN 'QF' THEN 3
                    WHEN 'SF' THEN 4 WHEN '3P' THEN 5 WHEN 'F' THEN 6 END,
         match_num`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/knockout/:id', async (req, res) => {
  const { home, away, date, time, homeScore, awayScore, homePens, awayPens, status } = req.body;
  const fields = [], vals = [];
  let i = 1;
  if (home      !== undefined) { fields.push(`home=$${i++}`);       vals.push(home || null); }
  if (away      !== undefined) { fields.push(`away=$${i++}`);       vals.push(away || null); }
  if (date      !== undefined) { fields.push(`match_date=$${i++}`); vals.push(date || null); }
  if (time      !== undefined) { fields.push(`match_time=$${i++}`); vals.push(time || null); }
  if (homeScore !== undefined) { fields.push(`home_score=$${i++}`); vals.push(homeScore !== '' ? homeScore : null); }
  if (awayScore !== undefined) { fields.push(`away_score=$${i++}`); vals.push(awayScore !== '' ? awayScore : null); }
  if (homePens  !== undefined) { fields.push(`home_pens=$${i++}`);  vals.push(homePens  !== '' ? homePens  : null); }
  if (awayPens  !== undefined) { fields.push(`away_pens=$${i++}`);  vals.push(awayPens  !== '' ? awayPens  : null); }
  if (status    !== undefined) { fields.push(`status=$${i++}`);     vals.push(status); }
  if (!fields.length) return res.status(400).json({ error: 'Nada que actualizar' });
  vals.push(req.params.id);
  try {
    await pool.query(`UPDATE knockout_matches SET ${fields.join(',')} WHERE id=$${i}`, vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────
   SPA FALLBACK
───────────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ─────────────────────────────────────────────
   START
───────────────────────────────────────────── */
initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    autoCloseMatches(); // run once immediately on startup
    setInterval(autoCloseMatches, 60 * 1000);
  })
  .catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
