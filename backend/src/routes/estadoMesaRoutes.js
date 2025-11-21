import {Router } from 'express';
import { showEstadoMesa, showEstadoMesaId, addEstadoMesa, updateEstadoMesa, deleteEstadoMesa } from '../controllers/estadoMesaController.js';

const router = Router();
const renard ='/estado-mesa'

router.route(renard)
.get(showEstadoMesa)  
.post(addEstadoMesa); 

router.route(`${renard}/:id`)
.get(showEstadoMesaId)  
.put(updateEstadoMesa)  
.delete(deleteEstadoMesa); 

export default router;
