// routes/produccion.routes.js
// GET   /api/produccion/lotes              — Listar lotes
// POST  /api/produccion/lotes              — Crear lote
// PATCH /api/produccion/lotes/:id/status   — Cambiar estado del lote
// GET   /api/produccion/maquinas           — Listar máquinas disponibles
const router       = require('express').Router();
const pool         = require('../db/pool');
const auth         = require('../middleware/auth');
const checkPermiso = require('../middleware/checkPermiso');

const permiso = checkPermiso('supply');

const ESTADOS_VALIDOS = ['En Proceso', 'Completado', 'Cancelado'];

// ── GET /api/produccion/maquinas ──────────────────────────────────────────────
// Debe ir ANTES de /lotes/:id para evitar conflictos de rutas
router.get('/maquinas', auth, permiso, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM MAQUINA ORDER BY nombre_maquina ASC"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener máquinas.' });
  }
});

// ── GET /api/produccion/lotes ─────────────────────────────────────────────────
router.get('/lotes', auth, permiso, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id_lote, l.cantidad_esperada,
              l.fecha_inicio, l.fecha_fin_estimada AS fecha_fin,
              l.estado_lote,
              m.nombre_maquina AS maquina,
              pr.nombre_producto,
              u.nombre_completo AS operario,
              -- Progreso estimado por tiempo (0-100)
              LEAST(100, GREATEST(0, ROUND(
                TIMESTAMPDIFF(MINUTE, l.fecha_inicio, NOW()) /
                NULLIF(TIMESTAMPDIFF(MINUTE, l.fecha_inicio, l.fecha_fin_estimada), 0) * 100
              ))) AS progreso
       FROM LOTE_PRODUCCION l
       JOIN MAQUINA  m  ON l.id_maquina  = m.id_maquina
       JOIN PRODUCTO pr ON l.id_producto = pr.id_producto
       JOIN USUARIO  u  ON l.id_usuario  = u.id_usuario
       ORDER BY l.fecha_inicio DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener lotes.' });
  }
});

// ── POST /api/produccion/lotes ────────────────────────────────────────────────
router.post('/lotes', auth, permiso, async (req, res) => {
  const { id_maquina, id_producto, cantidad_esperada, fecha_fin_estimada } = req.body;
  if (!id_maquina || !id_producto || !cantidad_esperada)
    return res.status(400).json({
      error: 'id_maquina, id_producto y cantidad_esperada son obligatorios.'
    });
  try {
    const id_lote = 'lote-' + Date.now();
    await pool.query(
      `INSERT INTO LOTE_PRODUCCION
         (id_lote, id_maquina, id_producto, id_usuario,
          cantidad_esperada, fecha_inicio, fecha_fin_estimada, estado_lote)
       VALUES (?,?,?,?,?,NOW(),?,'En Proceso')`,
      [id_lote, id_maquina, id_producto, req.usuario.id,
       cantidad_esperada, fecha_fin_estimada || null]
    );
    res.status(201).json({ mensaje: 'Lote de producción creado.', id_lote });
  } catch {
    res.status(500).json({ error: 'Error al crear el lote.' });
  }
});

// ── PATCH /api/produccion/lotes/:id/status ────────────────────────────────────
router.patch('/lotes/:id/status', auth, permiso, async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS_VALIDOS.includes(estado))
    return res.status(400).json({
      error: `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`
    });
  try {
    const [r] = await pool.query(
      'UPDATE LOTE_PRODUCCION SET estado_lote=? WHERE id_lote=?',
      [estado, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Lote no encontrado.' });
    res.json({ mensaje: `Estado del lote actualizado a '${estado}'.` });
  } catch {
    res.status(500).json({ error: 'Error al actualizar el lote.' });
  }
});

module.exports = router;
