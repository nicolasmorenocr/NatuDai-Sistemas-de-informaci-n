// ==============================================================================
// NatuDai  — Backend API
// Alineado con mapa de endpoints 
// ==============================================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'NatuDai_Super_Secret_Key_2026';

app.use(cors());
app.use(express.json());

// Pool MariaDB 
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'natudai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//  Middleware: verificar JWT 
const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(403).json({ error: 'Token no proporcionado.' });
  try {
    req.usuario = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

//  Middleware: verificar permiso por ruta

const checkPermiso = (ruta) => async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.permisos_json FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(403).json({ error: 'Usuario no encontrado.' });

    const permisos = typeof rows[0].permisos_json === 'string'
      ? JSON.parse(rows[0].permisos_json)
      : rows[0].permisos_json;

    if (!permisos.includes(ruta)) {
      return res.status(403).json({ error: `Sin acceso al módulo '${ruta}'.` });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Error al verificar permisos.' });
  }
};

const soloAdmin = checkPermiso('personal');

// Vista raíz 
app.get('/', (_req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:40px;background:#f8fafc;text-align:center">
      <h1 style="color:#059669">🚀 NatuDai ERP — Servidor en línea</h1>
      <p style="color:#475569">Puerto ${PORT} · Base de datos: natudai</p>
      <a href="/api/setup-passwords"
         style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;
                text-decoration:none;display:inline-block;margin-top:16px">
        Configurar contraseñas (solo primera vez)
      </a>
    </body></html>
  `);
});

// Setup: encriptar contraseñas iniciales 
app.get('/api/setup-passwords', async (_req, res) => {
  try {
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashSupply = await bcrypt.hash('supply123', 10);
    await pool.query("UPDATE USUARIO SET password_hash=? WHERE cedula='10102020'", [hashAdmin]);
    await pool.query("UPDATE USUARIO SET password_hash=? WHERE cedula='20203030'", [hashSupply]);
    res.send(`
      <h2 style="color:green;font-family:sans-serif;padding:40px">
        ✅ Contraseñas encriptadas.<br>
        Admin → cédula: 10102020 / pass: admin123<br>
        Supply → cédula: 20203030 / pass: supply123
      </h2>
    `);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// ==============================================================================
// MÓDULO 1: AUTENTICACIÓN
// POST /api/auth/login    — Iniciar sesión
// POST /api/auth/logout   — Cerrar sesión (invalida token en cliente)
// GET  /api/auth/profile  — Perfil del usuario activo
// ==============================================================================

app.post('/api/auth/login', async (req, res) => {
  const { cedula, password } = req.body;
  if (!cedula || !password)
    return res.status(400).json({ error: 'Cédula y contraseña son obligatorias.' });

  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre_completo, u.cedula,
              u.password_hash, u.estado_activo,
              r.nombre_rol, r.permisos_json
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       WHERE u.cedula = ? AND u.estado_activo = TRUE`,
      [cedula]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo.' });

    const usuario = rows[0];
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    const permisos = typeof usuario.permisos_json === 'string'
      ? JSON.parse(usuario.permisos_json)
      : usuario.permisos_json;

    const token = jwt.sign(
      {
        id: usuario.id_usuario, cedula: usuario.cedula,
        rol: usuario.nombre_rol, nombre: usuario.nombre_completo
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { nombre: usuario.nombre_completo, rol: usuario.nombre_rol, permisos },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// logout en JWT 
app.post('/api/auth/logout', auth, (_req, res) => {
  res.json({ mensaje: 'Sesión cerrada. Elimina el token del cliente.' });
});

app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre_completo, u.cedula, u.email,
              r.nombre_rol, r.permisos_json
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const u = rows[0];
    res.json({
      id_usuario: u.id_usuario,
      nombre_completo: u.nombre_completo,
      cedula: u.cedula,
      email: u.email,
      rol: u.nombre_rol,
      permisos: typeof u.permisos_json === 'string'
        ? JSON.parse(u.permisos_json)
        : u.permisos_json,
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil.' });
  }
});

// ==============================================================================
// MÓDULO 2: INVENTARIO (rutas /api/productos según mapa del equipo)
// GET    /api/productos        — Listar todos
// GET    /api/productos/:id    — Obtener uno
// POST   /api/productos        — Crear
// PUT    /api/productos/:id    — Actualizar
// DELETE /api/productos/:id    — Eliminar
// ==============================================================================

app.get('/api/productos', auth, checkPermiso('inventario'), async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM PRODUCTO ORDER BY nombre_producto ASC');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

app.get('/api/productos/:id', auth, checkPermiso('inventario'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM PRODUCTO WHERE id_producto = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

app.post('/api/productos', auth, checkPermiso('inventario'), async (req, res) => {
  const { nombre_producto, descripcion, precio_venta,
    stock_actual, stock_minimo, unidad_medida } = req.body;
  if (!nombre_producto || !precio_venta)
    return res.status(400).json({ error: 'nombre_producto y precio_venta son obligatorios.' });
  try {
    const id = 'prod-' + Date.now();
    await pool.query(
      `INSERT INTO PRODUCTO
         (id_producto, nombre_producto, descripcion, stock_actual, stock_minimo, precio_venta, unidad_medida)
       VALUES (?,?,?,?,?,?,?)`,
      [id, nombre_producto, descripcion || '', stock_actual || 0,
        stock_minimo || 0, precio_venta, unidad_medida || 'Und']
    );
    res.status(201).json({ mensaje: 'Producto creado.', id_producto: id });
  } catch {
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
});

app.put('/api/productos/:id', auth, checkPermiso('inventario'), async (req, res) => {
  const { nombre_producto, descripcion, precio_venta,
    stock_actual, stock_minimo, unidad_medida } = req.body;
  try {
    const [r] = await pool.query(
      `UPDATE PRODUCTO
       SET nombre_producto=?, descripcion=?, precio_venta=?,
           stock_actual=?, stock_minimo=?, unidad_medida=?
       WHERE id_producto=?`,
      [nombre_producto, descripcion, precio_venta,
        stock_actual, stock_minimo, unidad_medida, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ mensaje: 'Producto actualizado.' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

app.delete('/api/productos/:id', auth, checkPermiso('inventario'), async (req, res) => {
  try {
    const [r] = await pool.query(
      'DELETE FROM PRODUCTO WHERE id_producto = ?', [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ mensaje: 'Producto eliminado.' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});

// Materia prima 
app.get('/api/materia-prima', auth, checkPermiso('inventario'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, p.razon_social AS proveedor
       FROM MATERIA_PRIMA m
       JOIN PROVEEDOR p ON m.id_proveedor = p.id_proveedor
       ORDER BY m.nombre_mp ASC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener materias primas.' });
  }
});

// ==============================================================================
// MÓDULO 3: VENTAS
// GET    /api/ventas       — Listar todas
// GET    /api/ventas/:id   — Obtener una
// POST   /api/ventas       — Registrar venta (transacción ACID)
// DELETE /api/ventas/:id   — Eliminar venta
// ==============================================================================

app.get('/api/ventas', auth, checkPermiso('ventas'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_pedido, c.nombre AS cliente,
              pr.nombre_producto AS producto,
              dp.cantidad, dp.precio_unitario,
              p.total_pagar, p.estado_pedido, p.fecha_orden
       FROM PEDIDO p
       JOIN CLIENTE c         ON p.id_cliente  = c.id_cliente
       JOIN DETALLE_PEDIDO dp ON dp.id_pedido  = p.id_pedido
       JOIN PRODUCTO pr       ON pr.id_producto = dp.id_producto
       ORDER BY p.fecha_orden DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener ventas.' });
  }
});

app.get('/api/ventas/:id', auth, checkPermiso('ventas'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_pedido, c.nombre AS cliente,
              pr.nombre_producto AS producto,
              dp.cantidad, dp.precio_unitario,
              p.total_pagar, p.estado_pedido, p.fecha_orden
       FROM PEDIDO p
       JOIN CLIENTE c         ON p.id_cliente  = c.id_cliente
       JOIN DETALLE_PEDIDO dp ON dp.id_pedido  = p.id_pedido
       JOIN PRODUCTO pr       ON pr.id_producto = dp.id_producto
       WHERE p.id_pedido = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Venta no encontrada.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener la venta.' });
  }
});

app.post('/api/ventas', auth, checkPermiso('ventas'), async (req, res) => {
  const { id_cliente, id_producto, cantidad, precio_unitario } = req.body;
  if (!id_cliente || !id_producto || !cantidad || !precio_unitario)
    return res.status(400).json({ error: 'id_cliente, id_producto, cantidad y precio_unitario son obligatorios.' });

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const total = cantidad * precio_unitario;
    const id_pedido = 'ped-' + Date.now();

    await conn.query(
      `INSERT INTO PEDIDO (id_pedido, id_cliente, id_usuario, total_pagar, estado_pedido)
       VALUES (?,?,?,?,'Completado')`,
      [id_pedido, id_cliente, req.usuario.id, total]
    );
    await conn.query(
      `INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?,?,?,?,?)`,
      [id_pedido, id_producto, cantidad, precio_unitario, total]
    );
    // Descontar del inventario
    await conn.query(
      'UPDATE PRODUCTO SET stock_actual = stock_actual - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );
    await conn.commit();
    res.status(201).json({ mensaje: 'Venta registrada con éxito.', id_pedido });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Error al registrar la venta.' });
  } finally {
    conn.release();
  }
});

app.delete('/api/ventas/:id', auth, checkPermiso('ventas'), async (req, res) => {
  try {
    const [r] = await pool.query(
      'DELETE FROM PEDIDO WHERE id_pedido = ?', [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Venta no encontrada.' });
    res.json({ mensaje: 'Venta eliminada.' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar la venta.' });
  }
});

// ==============================================================================
// MÓDULO 4: PEDIDOS
// GET   /api/pedidos           — Listar todos
// GET   /api/pedidos/:id       — Obtener uno
// POST  /api/pedidos           — Crear pedido
// PUT   /api/pedidos/:id       — Actualizar pedido completo
// PATCH /api/pedidos/:id/status — Cambiar solo el estado
// ==============================================================================

app.get('/api/pedidos', auth, checkPermiso('pedidos'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_pedido, c.nombre AS cliente,
              pr.nombre_producto AS producto,
              dp.cantidad, p.total_pagar,
              p.estado_pedido AS estado, p.fecha_orden
       FROM PEDIDO p
       JOIN CLIENTE c         ON p.id_cliente  = c.id_cliente
       JOIN DETALLE_PEDIDO dp ON dp.id_pedido  = p.id_pedido
       JOIN PRODUCTO pr       ON pr.id_producto = dp.id_producto
       ORDER BY p.fecha_orden DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener pedidos.' });
  }
});

app.get('/api/pedidos/:id', auth, checkPermiso('pedidos'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_pedido, c.nombre AS cliente,
              pr.nombre_producto AS producto,
              dp.cantidad, dp.precio_unitario,
              p.total_pagar, p.estado_pedido AS estado, p.fecha_orden
       FROM PEDIDO p
       JOIN CLIENTE c         ON p.id_cliente  = c.id_cliente
       JOIN DETALLE_PEDIDO dp ON dp.id_pedido  = p.id_pedido
       JOIN PRODUCTO pr       ON pr.id_producto = dp.id_producto
       WHERE p.id_pedido = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener el pedido.' });
  }
});

app.post('/api/pedidos', auth, checkPermiso('pedidos'), async (req, res) => {
  const { id_cliente, id_producto, cantidad, precio_unitario } = req.body;
  if (!id_cliente || !id_producto || !cantidad || !precio_unitario)
    return res.status(400).json({ error: 'id_cliente, id_producto, cantidad y precio_unitario son obligatorios.' });

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const total = cantidad * precio_unitario;
    const id_pedido = 'ped-' + Date.now();
    await conn.query(
      `INSERT INTO PEDIDO (id_pedido, id_cliente, id_usuario, total_pagar, estado_pedido)
       VALUES (?,?,?,?,'Pendiente')`,
      [id_pedido, id_cliente, req.usuario.id, total]
    );
    await conn.query(
      `INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?,?,?,?,?)`,
      [id_pedido, id_producto, cantidad, precio_unitario, total]
    );
    await conn.commit();
    res.status(201).json({ mensaje: 'Pedido creado.', id_pedido });
  } catch {
    await conn.rollback();
    res.status(500).json({ error: 'Error al crear el pedido.' });
  } finally {
    conn.release();
  }
});

app.put('/api/pedidos/:id', auth, checkPermiso('pedidos'), async (req, res) => {
  const { estado_pedido, total_pagar } = req.body;
  try {
    const [r] = await pool.query(
      'UPDATE PEDIDO SET estado_pedido=?, total_pagar=? WHERE id_pedido=?',
      [estado_pedido, total_pagar, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json({ mensaje: 'Pedido actualizado.' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar el pedido.' });
  }
});

// PATCH —  cambia  estado, sin tocar el resto del pedido
app.patch('/api/pedidos/:id/status', auth, checkPermiso('pedidos'), async (req, res) => {
  const { estado } = req.body;
  const validos = ['Pendiente', 'En proceso', 'Enviado', 'Completado', 'Cancelado'];
  if (!validos.includes(estado))
    return res.status(400).json({ error: `Estado inválido. Opciones: ${validos.join(', ')}` });
  try {
    const [r] = await pool.query(
      'UPDATE PEDIDO SET estado_pedido=? WHERE id_pedido=?',
      [estado, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json({ mensaje: `Estado actualizado a '${estado}'.` });
  } catch {
    res.status(500).json({ error: 'Error al cambiar el estado.' });
  }
});

// ==============================================================================
// MÓDULO 5: PERSONAL (rutas /api/empleados según mapa del equipo)
// GET    /api/empleados        — Listar todos
// GET    /api/empleados/:id    — Obtener uno
// POST   /api/empleados        — Crear empleado
// PUT    /api/empleados/:id    — Actualizar empleado
// DELETE /api/empleados/:id    — Desactivar (soft delete)
// ==============================================================================

app.get('/api/empleados', auth, soloAdmin, async (_req, res) => {
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

app.get('/api/empleados/:id', auth, soloAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.cedula, u.nombre_completo,
              u.email, u.estado_activo, r.nombre_rol
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado.' });
    res.json({ ...rows[0], estado: rows[0].estado_activo ? 'Activo' : 'Inactivo' });
  } catch {
    res.status(500).json({ error: 'Error al obtener el empleado.' });
  }
});

app.post('/api/empleados', auth, soloAdmin, async (req, res) => {
  const { nombre_completo, cedula, email, id_rol, password } = req.body;
  if (!nombre_completo || !cedula || !password)
    return res.status(400).json({ error: 'nombre_completo, cedula y password son obligatorios.' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const id = 'usr-' + Date.now();
    await pool.query(
      `INSERT INTO USUARIO (id_usuario, id_rol, nombre_completo, cedula, email, password_hash, estado_activo)
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

app.put('/api/empleados/:id', auth, soloAdmin, async (req, res) => {
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

// Soft delete — no borrar un usuario por trazabilidad de pedidos y lotes
app.delete('/api/empleados/:id', auth, soloAdmin, async (req, res) => {
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

// Listar roles 
app.get('/api/roles', auth, soloAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_rol, nombre_rol FROM ROL ORDER BY id_rol');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener roles.' });
  }
});

// ==============================================================================
// MÓDULO 6: PRODUCCIÓN
// GET  /api/produccion/lotes       — Listar lotes
// POST /api/produccion/lotes       — Crear lote
// PATCH /api/produccion/lotes/:id/status — Cambiar estado
// ==============================================================================

app.get('/api/produccion/lotes', auth, checkPermiso('supply'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id_lote, l.cantidad_esperada,
              l.fecha_inicio, l.fecha_fin_estimada AS fecha_fin,
              l.estado_lote,
              m.nombre_maquina AS maquina,
              pr.nombre_producto,
              u.nombre_completo AS operario
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

app.post('/api/produccion/lotes', auth, checkPermiso('supply'), async (req, res) => {
  const { id_maquina, id_producto, cantidad_esperada, fecha_fin_estimada } = req.body;
  if (!id_maquina || !id_producto || !cantidad_esperada)
    return res.status(400).json({ error: 'id_maquina, id_producto y cantidad_esperada son obligatorios.' });
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
    res.status(201).json({ mensaje: 'Lote creado.', id_lote });
  } catch {
    res.status(500).json({ error: 'Error al crear el lote.' });
  }
});

app.patch('/api/produccion/lotes/:id/status', auth, checkPermiso('supply'), async (req, res) => {
  const { estado } = req.body;
  const validos = ['En Proceso', 'Completado', 'Cancelado'];
  if (!validos.includes(estado))
    return res.status(400).json({ error: `Estado inválido. Opciones: ${validos.join(', ')}` });
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

// ==============================================================================
// MÓDULO 7: DASHBOARD / KPIs
// GET /api/dashboard/kpis  — Métricas principales
// GET /api/alertas         — Productos bajo stock mínimo
// GET /api/alertas/:id     — Detalle de un producto en alerta
// ==============================================================================

app.get('/api/dashboard/kpis', auth, checkPermiso('dashboard'), async (_req, res) => {
  try {
    const [[prod], [ing], [ped], [lot], [emp]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS stock_critico FROM PRODUCTO WHERE stock_actual <= stock_minimo'),
      pool.query("SELECT COALESCE(SUM(total_pagar),0) AS ingresos_totales FROM PEDIDO WHERE estado_pedido='Completado'"),
      pool.query("SELECT COUNT(*) AS pedidos_activos FROM PEDIDO WHERE estado_pedido NOT IN ('Completado','Cancelado')"),
      pool.query("SELECT COUNT(*) AS lotes_activos FROM LOTE_PRODUCCION WHERE estado_lote='En Proceso'"),
      pool.query('SELECT COUNT(*) AS empleados_activos FROM USUARIO WHERE estado_activo=TRUE'),
    ]);
    res.json({
      stock_critico: prod[0].stock_critico,
      ingresos_totales: ing[0].ingresos_totales,
      pedidos_activos: ped[0].pedidos_activos,
      lotes_activos: lot[0].lotes_activos,
      empleados_activos: emp[0].empleados_activos,
    });
  } catch {
    res.status(500).json({ error: 'Error al calcular KPIs.' });
  }
});

// Alertas: productos  debajo del stock mínimo
app.get('/api/alertas', auth, checkPermiso('dashboard'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_producto, nombre_producto,
              stock_actual, stock_minimo,
              (stock_minimo - stock_actual) AS unidades_faltantes
       FROM PRODUCTO
       WHERE stock_actual <= stock_minimo
       ORDER BY unidades_faltantes DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

app.get('/api/alertas/:id', auth, checkPermiso('dashboard'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_producto, nombre_producto,
              stock_actual, stock_minimo,
              (stock_minimo - stock_actual) AS unidades_faltantes
       FROM PRODUCTO
       WHERE id_producto = ? AND stock_actual <= stock_minimo`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Producto no encontrado o sin alerta activa.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener la alerta.' });
  }
});

// ==============================================================================
// ARRANQUE
// ==============================================================================
app.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log(`🚀  NatuDai  activo en: http://localhost:${PORT}`);
  console.log(`🛡️   RBAC por permisos_json · JWT 8h`);
  console.log('=============================================================\n');
});