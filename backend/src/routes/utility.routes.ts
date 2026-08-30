import { Router } from 'express';
import { UtilityController } from '../controllers/utility.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.post('/', authenticateJwt, requireRoomAccess([MemberRole.MANAGER, MemberRole.DELEGATED_EDITOR]), UtilityController.createUtility);
router.get('/:roomId', authenticateJwt, requireRoomAccess(), UtilityController.getMonthlyUtilities);
router.delete('/:id', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), UtilityController.deleteUtility);

export default router;
