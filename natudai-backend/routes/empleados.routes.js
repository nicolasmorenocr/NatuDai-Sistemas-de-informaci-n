// routes/empleados.routes.js
// GET    /api/empleados        — Listar todos
// GET    /api/empleados/:id    — Obtener uno
// POST   /api/empleados        — Crear
// PUT    /api/empleados/:id    — Actualizar
// DELETE /api/empleados/:id    — Desactivar (soft delete)
// GET    /api/empleados/roles  — Listar roles disponibles
const router       = require('express').Router();
const bcrypt       = require('bcryptjs');
const pool         = require('../db/pool');
const auth         = require('../middleware/auth');
const checkPermiso = require('../middleware/checkPermiso');

// Solo el rol con acceso a 'personal' puede gestionar empleados
const soloAdmin = checkPermiso('personal');

// ── GET /api/empleados/roles ──────────────────────────────────────────────────
// Debe ir ANTES de /:id para que no confunda 'roles' con un id
router.get('/roles', auth, soloAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_rol, nombre_rol, descripcion FROM ROL ORDER BY id_rol'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener roles.' });
  }
});

// ── GET /api/empleados ────────────────────────────────────────────────────────
router.get('/', auth, soloAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.cedula, u.nombre_completo,
              u.email, u.estado_activo,
              r.id_rol, r.nombre_rol
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       ORDER BY u.nombre_completo ASC`
    );
    res.json(rows.map(u => ({ ...u, estado: u.estado_activo ? 'Activo' : 'Inactivo' })));
  } catch {
    res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});

// ── GET /api/empleados/:id ────────────────────────────────────────────────────
router.get('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.cedula, u.nombre_completo,
              u.email, u.estado_activo, r.id_rol, r.nombre_rol
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado.' });
    const u = rows[0];
    res.json({ ...u, estado: u.estado_activo ? 'Activo' : 'Inactivo' });
  } catch {
    res.status(500).json({ error: 'Error al obtener el empleado.' });
  }
});

// ── POST /api/empleados ───────────────────────────────────────────────────────
router.post('/', auth, soloAdmin, async (req, res) => {
  const { nombre_completo, cedula, email, id_rol, password } = req.body;
  if (!nombre_completo || !cedula || !password)
    return res.status(400).json({
      error: 'nombre_completo, cedula y password son obligatorios.'
    });
  try {
    const hash = await bcrypt.hash(password, 10);
    const id   = 'usr-' + Date.now();
    await pool.query(
      `INSERT INTO USUARIO
         (id_usuario, id_rol, nombre_completo, cedula, email, password_hash, estado_activo)
       VALUES (?,?,?,?,?,?,TRUE)`,
      [id, id_rol, nombre_completo, cedula, email || '', hash]
    );
    res.status(201).json({ mensaje: 'Empleado creado.', id_usuario: id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'La cédula o email ya están registrados.' });
    res.status(500).json({ error: 'Error al crear el empleado.' });
  }
});

// ── PUT /api/empleados/:id ────────────────────────────────────────────────────
router.put('/:id', auth, soloAdmin, async (req, res) => {
  const { nombre_completo, email, id_rol, estado_activo } = req.body;
  try {
    const [r] = await pool.query(
      `UPDATE USUARIO
       SET nombre_completo=?, email=?, id_rol=?, estado_activo=?
       WHERE id_usuario=?`,
      [nombre_completo, email, id_rol, estado_activo, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Empleado no encontrado.' });
    res.json({ mensaje: 'Empleado actualizado.' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar el empleado.' });
  }
});

// ── DELETE /api/empleados/:id — Soft delete ───────────────────────────────────
// No se borra el registro para mantener trazabilidad en pedidos y lotes
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const [r] = await pool.query(
      'UPDATE USUARIO SET estado_activo=FALSE WHERE id_usuario=?',
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Empleado no encontrado.' });
    res.json({ mensaje: 'Empleado desactivado.' });
  } catch {
    res.status(500).json({ error: 'Error al desactivar el empleado.' });
  }
});

module.exports = router;
