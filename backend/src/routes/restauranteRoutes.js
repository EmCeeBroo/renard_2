import {Router} from 'express';
import { showRestaurante, showRestauranteId, addRestaurante, updateRestaurante, deleteRestaurante, showRestauranteByRol } from '../controllers/restauranteController.js';
import upload from '../middleware/upload.js';

const router = Router();
const renard='/restaurante';

router.route(renard)
.get(showRestaurante)
.post(upload.single('url_imagen'), addRestaurante);

router.route(`${renard}/:id`)
.get(showRestauranteId)
.put(upload.single('url_imagen'), updateRestaurante)
.delete(deleteRestaurante);

router.route(`${renard}/rol/:rolId`)
.get(showRestauranteByRol);

export default router;
