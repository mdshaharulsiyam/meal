import { Router } from 'express';
import { MealController } from '../controllers/meal.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireRoomAccess } from '../middlewares/rbac.middleware';
import { MemberRole } from '../constants/enums';

const router = Router();

router.get('/:roomId', authenticateJwt, requireRoomAccess(), MealController.getDailyMeals);
router.post('/batch', authenticateJwt, requireRoomAccess([MemberRole.MANAGER, MemberRole.DELEGATED_EDITOR]), MealController.batchUpdateMeals);

export default router;
