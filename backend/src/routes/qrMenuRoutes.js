import {Router } from 'express';
import { showQrMenu, showQrMenuId, addQrMenu, updateQrMenu, deleteQrMenu } from '../controllers/qrMenuController.js';

const router = Router();
const renard ='/qr-menu';

router.route(renard)
.get(showQrMenu)  
.post(addQrMenu); 

router.route(`${renard}/:id`)
.get(showQrMenuId)  
.put(updateQrMenu)  
.delete(deleteQrMenu); 

export default router;
