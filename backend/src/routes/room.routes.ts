import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.post('/', authenticateJwt, RoomController.createRoom);
router.post('/join', authenticateJwt, RoomController.joinRoomByCode);
router.post('/leave', authenticateJwt, RoomController.leaveRoom);
router.get('/:roomId', authenticateJwt, requireRoomAccess(), RoomController.getRoomDetails);
router.patch('/members/role', authenticateJwt, requireRoomAccess([MemberRole.MANAGER]), RoomController.updateMemberRole);

export default router;
