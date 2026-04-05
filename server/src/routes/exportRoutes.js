import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  exportPDF,
  exportExcel,
  exportDashboardPDF,
} from '../controllers/exportController.js';

const router = Router();

router.post('/pdf', authenticate, exportPDF);
router.post('/excel', authenticate, exportExcel);
router.post('/dashboard-pdf', authenticate, exportDashboardPDF);

export default router;
