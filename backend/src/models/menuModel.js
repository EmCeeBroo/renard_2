import express from 'express';
import { showMenus, showMenuById, addMenu, updateMenu, deleteMenu,
} from '../controllers/menuController.js';

const router = express.Router();

// Rutas CRUD para menús
router.get('/menus', showMenus); // Obtener todos los menús
router.get('/menus/:id', showMenuById); // Obtener un menú por ID
router.post('/menus', addMenu); // Crear un nuevo menú
router.put('/menus/:id', updateMenu); // Actualizar un menú existente
router.delete('/menus/:id', deleteMenu); // Eliminar un menú

export default router;
