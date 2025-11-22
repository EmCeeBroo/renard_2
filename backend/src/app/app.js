import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// 1. CORS - permitir peticiones desde Live Server
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    /^http:\/\/localhost:\d+$/,    // ← REGEX para cualquier puerto localhost
    /^http:\/\/127\.0\.0\.1:\d+$/, // ← REGEX para cualquier puerto 127.0.0.1
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Morgan para logs
app.use(morgan('dev'));

// 3. Parsers de body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ARCHIVOS ESTÁTICOS (solo imágenes del backend)
// ============================================
app.use('/img/perfiles', express.static(path.join(__dirname, 'assets/img/perfiles')));
app.use('/img/producto', express.static(path.join(__dirname, 'assets/img/producto')));

// ============================================
// HOME FRONTEND
// ============================================
app.get('/', (req, res) => {
  // Redirige al frontend que está en un servidor diferente
  res.redirect('http://192.168.1.78:5500/renard_oficial/frontend/home/home.html');
});

// ============================================
// IMPORTAR RUTAS DE API
// ============================================
import authRoutes from '../../src/routes/authRoutes.js';
import estadoMesa from '../../src/routes/estadoMesaRoutes.js';
import estadoReservacion from '../../src/routes/estadoReservacionRoutes.js';
import estadoUsuario from '../../src/routes/estadoUsuarioRoutes.js';
import historialReservacion from '../../src/routes/historialReservacionRoutes.js';
import menu from '../../src/routes/menuRoutes.js';
import mesa from '../../src/routes/mesaRoutes.js';
import perfil from '../../src/routes/perfilRoutes.js';
import producto from '../../src/routes/productoRoutes.js';
import qrMenu from '../../src/routes/qrMenuRoutes.js';
import reservacion from '../../src/routes/reservacionRoutes.js';
import restaurante from '../../src/routes/restauranteRoutes.js';
import rol from '../../src/routes/rolRoutes.js';
import sucursal from '../../src/routes/sucursalRoutes.js';
import tipoDocumento from '../../src/routes/tipoDocumentoRoutes.js';
import usuarioApi from '../../src/routes/usuarioApiRoutes.js';
import usuario from '../../src/routes/usuarioRoutes.js';
import zonaRoutes from '../../src/routes/zonaRoutes.js';
import categoriaRoutes from '../../src/routes/categoriaRoutes.js';
import recuperarContrasenaRoutes from '../../src/routes/recuperarContrasenaRoutes.js';

// ============================================
// RUTAS DE API (todas bajo /renard)
// ============================================
app.use('/renard', [
  authRoutes,
  estadoMesa,
  estadoReservacion,
  estadoUsuario,
  historialReservacion,
  menu,
  mesa,
  perfil,
  producto,
  qrMenu,
  reservacion,
  restaurante,
  rol,
  sucursal,
  tipoDocumento,
  usuarioApi,
  usuario,
  zonaRoutes,
  categoriaRoutes,
  recuperarContrasenaRoutes
]);

// ============================================
// RUTA 404 PARA APIs NO ENCONTRADAS
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// ============================================
// FUNCIÓN PARA MOSTRAR LINK DEL SERVIDOR
// ============================================
export function showServerLink(port, isVM = true) {
  const host = isVM ? '127.0.0.1' : 'localhost';
  console.log(`🚀 Backend API corriendo en http://${host}:${port}`);
  console.log(`📡 Endpoints disponibles en http://${host}:${port}/renard/`);
  console.log(` Frontend Live Server en http://${host}:5500/frontend/home/home.html`);
}

console.log(
`🦊 RENARD - Panel Administrativo \nVersión 1.0 | Sistema de Gestión de Reservas`,
);
export default app;