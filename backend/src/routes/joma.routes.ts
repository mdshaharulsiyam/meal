import { Router } from 'express';
import { JomaController } from '../controllers/joma.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.post('/', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), JomaController.createJoma);
router.get('/:roomId', authenticateJwt, requireRoomAccess(), JomaController.getMonthlyJoma);
router.delete('/:id', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), JomaController.deleteJoma);

export default router;
