import {Router} from 'express';
import { showSucursales, showSucursalId, addSucursal, updateSucursal, deleteSucursal, showSucursalesByRestaurante } from '../controllers/sucursalController.js';

const router = Router();
const renard='/sucursal';

router.route(renard)
.get(showSucursales)  
.post(addSucursal); 

router.route(`${renard}/:id`)
.get(showSucursalId)
.put(updateSucursal)
.delete(deleteSucursal);

// Nueva ruta para obtener sucursales por restaurante
router.route(`${renard}/restaurante/:id`)
.get(showSucursalesByRestaurante);

export default router;
