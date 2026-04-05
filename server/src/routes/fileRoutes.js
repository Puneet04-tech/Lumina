import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/fileUpload.js';
import {
  uploadFile,
  getFiles,
  getFile,
  deleteFile,
} from '../controllers/fileController.js';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), uploadFile);
router.get('/', authenticate, getFiles);
router.get('/:id', authenticate, getFile);
router.delete('/:id', authenticate, deleteFile);

export default router;
