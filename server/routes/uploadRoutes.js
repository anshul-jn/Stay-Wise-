import express from 'express';
import upload from '../middleware/upload.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }
  
  // Return the path that can be accessed by the frontend
  const imagePath = `/uploads/${req.file.filename}`;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ success: true, url: `${baseUrl}${imagePath}` });
});

export default router;
