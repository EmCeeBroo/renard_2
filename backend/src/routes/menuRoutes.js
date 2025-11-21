import {Router } from 'express';
import { showMenu, showMenuId, addMenu, updateMenu, deleteMenu } from '../controllers/menuController.js';

const router = Router();
const renard ='/menu'

router.route(renard)
.get(showMenu)  
.post(addMenu); 

router.route(`${renard}/:id`)
.get(showMenuId)  
.put(updateMenu)  
.delete(deleteMenu); 

export default router;
