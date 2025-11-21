import {Router } from 'express';
import { showMesa, showMesaId, addMesa, updateMesa, deleteMesa, getMesasPorSucursal } from '../controllers/mesaController.js';

const router = Router();
const renard ='/mesa'

router.route(renard)
.get(showMesa)  
.post(addMesa); 

router.route(`${renard}/:id`)
.get(showMesaId)  
.put(updateMesa)  
.delete(deleteMesa); 

// Nueva ruta para obtener mesas por restaurante
router.get(`${renard}/sucursal/:sucursalId`, getMesasPorSucursal);

export default router;
