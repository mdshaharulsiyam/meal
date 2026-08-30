import { Router } from 'express';
import { SettlementController } from '../controllers/settlement.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.get('/:roomId/summary', authenticateJwt, requireRoomAccess(), SettlementController.getMonthlySummary);
router.post('/close-month', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), SettlementController.closeAndLockMonth);

export default router;
