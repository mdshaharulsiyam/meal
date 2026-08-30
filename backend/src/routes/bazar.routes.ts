import { Router } from 'express';
import { BazarController } from '../controllers/bazar.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.post('/', authenticateJwt, requireRoomAccess([MemberRole.MANAGER, MemberRole.DELEGATED_EDITOR]), BazarController.createBazar);
router.get('/:roomId', authenticateJwt, requireRoomAccess(), BazarController.getMonthlyBazar);
router.delete('/:id', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), BazarController.deleteBazar);

export default router;
