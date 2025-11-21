import {Router} from 'express';
import { showZona, showZonaId, addZona, updateZona, deleteZona, } from '../controllers/zonaController.js';

const router = Router();
const renard='/zona';

router.route(renard)
.get(showZona)  
.post(addZona); 

router.route(`${renard}/:id`)
.get(showZonaId)  
.put(updateZona)  
.delete(deleteZona); 

export default router;
