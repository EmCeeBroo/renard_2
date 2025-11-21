import {Router} from 'express';
import { showReservacion, showReservacionId, addReservacion, updateReservacion, updateEstadoReservacion, deleteReservacion, getReservacionesFiltradas, showReservacionesByRestaurante, showReservacionesByUsuario } from '../controllers/reservacionController.js';

const router = Router();
const renard='/reservacion';

router.route(renard)
.get(showReservacion)  
.post(addReservacion);


router.route(`${renard}/:id`)
.get(showReservacionId)  
.put(updateReservacion)  
.delete(deleteReservacion)

router.put(`${renard}/:id/estado`, updateEstadoReservacion);

// Nueva ruta para obtener reservaciones filtradas
router.get(`${renard}/filtradas`, getReservacionesFiltradas);

// Nueva ruta para obtener reservaciones por restaurante
router.route(`${renard}/restaurante/:id`)
.get(showReservacionesByRestaurante);

// Reservas por usuario
router.get(`${renard}/usuario/:id`, showReservacionesByUsuario);

export default router;

