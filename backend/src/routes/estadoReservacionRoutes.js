import {Router } from 'express';
import { showEstadoReservacion, showEstadoReservacionId, addEstadoReservacion, updateEstadoReservacion, deleteEstadoReservacion } from '../controllers/estadoReservacionController.js';

const router = Router();
const renard ='/estado-reservacion'

router.route(renard)
.get(showEstadoReservacion)  
.post(addEstadoReservacion); 

router.route(`${renard}/:id`)
.get(showEstadoReservacionId)  
.put(updateEstadoReservacion)  
.delete(deleteEstadoReservacion); 

export default router;
