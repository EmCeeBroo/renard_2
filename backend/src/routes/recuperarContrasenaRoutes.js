// ===== RUTAS PARA RECUPERACIÓN DE CONTRASEÑA =====
// Agregar estas rutas a tu archivo de rutas principal

import express from 'express';
import { enviarCorreoRecuperacion, validarTokenRecuperacion, restablecerContrasena } from '../controllers/recuperarContraseñaController.js'; // Asegúrate de que la ruta sea correcta
const router = express.Router();

// ===== 1. ENVIAR CORREO DE RECUPERACIÓN =====
// POST /renard/recuperar-contrasena
router.post('/recuperar-contrasena', enviarCorreoRecuperacion, async (req, res) => {
    console.log('🔄 POST /recuperar-contrasena - Iniciando proceso');
    console.log('📨 Body recibido:', req.body);
    
    try {
        await enviarCorreoRecuperacion(req, res);
    } catch (error) {
        console.error('❌ Error en ruta recuperar-contrasena:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ===== 2. VALIDAR TOKEN DE RECUPERACIÓN =====
// POST /renard/validar-token
router.post('/validar-token', validarTokenRecuperacion, async (req, res) => {
    console.log('🔍 POST /validar-token - Validando token');
    console.log('📨 Body recibido:', req.body);
    
    try {
        await validarTokenRecuperacion(req, res);
    } catch (error) {
        console.error('❌ Error en ruta validar-token:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ===== 3. RESTABLECER CONTRASEÑA =====
// POST /renard/restablecer-contrasena
router.post('/restablecer-contrasena', restablecerContrasena, async (req, res) => {
    console.log('🔄 POST /restablecer-contrasena - Procesando cambio');
    console.log('📨 Body recibido:', {
        token: req.body.token ? `${req.body.token.substring(0, 8)}...` : 'No token',
        nuevaContrasena: req.body.nuevaContrasena ? '***' : 'No password',
        confirmarContrasena: req.body.confirmarContrasena ? '***' : 'No confirm'
    });
    
    try {
        await restablecerContrasena(req, res);
    } catch (error) {
        console.error('❌ Error en ruta restablecer-contrasena:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ===== 4. SERVIR PÁGINA DE RECUPERACIÓN (OPCIONAL) =====
// GET /renard/reset-password (para servir el HTML estático)
router.get('/reset-password', (req, res) => {
    console.log('🌐 GET /reset-password - Sirviendo página de recuperación');
    console.log('🔗 Query params:', req.query);
    
    // Si tienes el HTML en una carpeta pública
    res.sendFile(path.join(__dirname, '../views/login/recuperar.html'));
    
    // O simplemente redirigir al frontend
    // res.redirect(`http://localhost:3000/views/login/recuperar.html?token=${req.query.token}`);
});

export default router;

// ===== CONFIGURACIÓN ADICIONAL PARA TU APP PRINCIPAL =====
/*
En tu app principal (app.js o server.js), asegúrate de tener:

import passwordRecoveryRoutes from './routes/passwordRecoveryRoutes.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS si es necesario
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Rutas
app.use('/renard', passwordRecoveryRoutes);

// Servir archivos estáticos (para el frontend)
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
*/

// ===== MIDDLEWARE DE DEBUGGING =====
// Middleware para loggear todas las requests (opcional)
/* === export const debugMiddleware = (req, res, next) => {
    console.log(`🔄 ${req.method} ${req.path}`);
    console.log('📨 Headers:', req.headers);
    console.log('📨 Body:', req.body);
    console.log('📨 Query:', req.query);
    console.log('---');
    next();
}; ======/*

// ===== CONFIGURACIÓN DE NODEMAILER =====
/*
Asegúrate de tener estas variables de entorno:

EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicación
*/