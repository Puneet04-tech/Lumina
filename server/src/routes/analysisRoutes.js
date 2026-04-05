import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  queryAnalysis,
  saveDashboard,
  getDashboards,
} from '../controllers/analysisController.js';

const router = Router();

router.post('/query', authenticate, queryAnalysis);
router.post('/dashboards', authenticate, saveDashboard);
router.get('/dashboards', authenticate, getDashboards);

export default router;
