import {Router} from 'express';
import { showRol, showRolId, addRol, updateRol, deleteRol } from '../controllers/rolController.js';

const router = Router();
const renard='/rol';

router.route(renard)
.get(showRol)  
.post(addRol); 

router.route(`${renard}/:id`)
.get(showRolId)  
.put(updateRol)  
.delete(deleteRol); 

export default router;
