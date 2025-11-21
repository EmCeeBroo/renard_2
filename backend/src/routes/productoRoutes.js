import express from 'express';
import { getProductos, getProductosPorRestaurante, getProductoById, createProducto, updateProducto, deleteProducto } from '../controllers/productoController.js';
import uploadProducto from '../middleware/uploadProducto.js';

const router = express.Router();

// Rutas para productos
router.get('/productos', getProductos);
router.get('/productos/restaurante', getProductosPorRestaurante);
router.get('/productos/:id', getProductoById);
router.post('/productos', uploadProducto.single('imagenproducto'), createProducto);
router.put('/productos/:id', uploadProducto.single('imagenproducto'), updateProducto);
router.delete('/productos/:id', deleteProducto);

export default router;
