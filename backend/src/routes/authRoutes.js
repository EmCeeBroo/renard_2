import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { encryptContraseña, compareContraseña } from '../library/appBcrypt.js'; // Asegúrate de que la ruta sea correcta
import { registerUsuario, loginUser } from '../models/modeloUsuario.js'; // Asegúrate de importar tus funciones correctamente
import { enviarCorreoBienvenida} from "../controllers/authController.js";

const router = Router();

// Ruta para registrar un nuevo usuario - CORREGIDA
router.post('/register',
  [
    body('correo').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('correo').isLength({ min: 6 }).withMessage('El correo debe tener al menos 6 caracteres'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('estado_usuario_fk').isInt().withMessage('El estado del usuario debe ser un número entero'),
  ],
  async (req, res) => {
    console.log('Body recibido:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { correo, contrasena, estado_usuario_fk } = req.body;
      const rol_fk = 4; // Usuario regular
      
      // Encriptar la contraseña antes de guardar
      const hashedContraseña = await encryptContraseña(contrasena);
      
      // Usar el modelo correctamente (parámetros individuales, no req/res)
      const user = await registerUsuario(correo, hashedContraseña, estado_usuario_fk, rol_fk);
      
      // Intentar enviar correo de bienvenida
      try {
        await enviarCorreoBienvenida(correo);
        console.log('Correo de bienvenida enviado correctamente a:', correo);
      } catch (emailError) {
        console.error('Error al enviar correo de bienvenida:', emailError.message);
        // No falla el registro si el correo falla
      }
      
      // Respuesta exitosa (TUS MENSAJES APARECERÁN AQUÍ)
      res.status(201).json({
        success: true,
        message: 'Usuario registrado con éxito desde las rutas',
        data: {
          usuario_id: user.insertId,
          correo: correo
        }
      });
      
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      res.status(500).json({
        success: false,
        error: 'Error al registrar usuario desde las rutas',
        details: err.message,
      });
    }
  }
);



// Ruta para iniciar sesión
router.post(
  '/login',
  [
    body('correo').notEmpty().withMessage('El correo es obligatorio'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { correo, contrasena } = req.body;
      console.log('Credenciales recibidas:', correo, contrasena);

      // Buscar al usuario en la base de datos
      const usuario = await loginUser(correo);
      if (!usuario) {
        console.log('Usuario no encontrado:', correo);
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Comparar la contraseña ingresada con la almacenada
      const passwordIsValid = await compareContraseña(contrasena, usuario.contrasena);
      console.log('Contraseña válida:', passwordIsValid);
      // Si la contraseña no es válida, retornar error
      if (!passwordIsValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar un token JWT para el usuario
      const token = jwt.sign(
        { id: usuario.id_usuario, correo: usuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token,
        usuario,
      });
    } catch (err) {
      res.status(500).json({
        error: 'Error al iniciar sesión',
        details: err.message,
      });
    }
  }
);


export default router; // Exportación ES6