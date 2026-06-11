import express from 'express';
import upload from '../middleware/upload.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }
  
  // Return the path that can be accessed by the frontend
  // Backslashes (Windows) need to be replaced with forward slashes for URLs
  const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
  res.json({ success: true, url: `http://localhost:5000${imagePath}` });
});

export default router;
