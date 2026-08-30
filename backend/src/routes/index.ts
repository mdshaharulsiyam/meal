import { Router } from 'express';
import authRoutes from './auth.routes';
import roomRoutes from './room.routes';
import mealRoutes from './meal.routes';
import bazarRoutes from './bazar.routes';
import jomaRoutes from './joma.routes';
import utilityRoutes from './utility.routes';
import settlementRoutes from './settlement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/meals', mealRoutes);
router.use('/bazar', bazarRoutes);
router.use('/joma', jomaRoutes);
router.use('/utilities', utilityRoutes);
router.use('/settlement', settlementRoutes);

export default router;
