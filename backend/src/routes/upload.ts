import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { VideoService } from '../services/videoService';

const router = Router();
const videoService = new VideoService();

// Configure multer for memory storage (upload to Supabase)
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  }
});

// POST /api/upload - Upload video file
router.post('/', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('📤 Uploading video:', req.file.originalname);
    console.log('📦 File size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');

    // Generate unique filename
    const timestamp = Date.now();
    const sanitized = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${timestamp}-${sanitized}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('video')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload to storage',
        details: uploadError.message 
      });
    }

    console.log('✅ File uploaded to storage:', storagePath);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('video')
      .getPublicUrl(storagePath);

    console.log('📍 Public URL:', urlData.publicUrl);

    // Save to database
    const video: any = await videoService.createVideo({
      original_filename: req.file.originalname,
      file_path: urlData.publicUrl,
      storage_path: storagePath,
      status: 'uploaded',
    });

    console.log('✅ Video uploaded successfully:', video.id);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      videoId: video.id,  // Add videoId at top level for easy access
      publicUrl: urlData.publicUrl,  // Add publicUrl at top level
      file: {
        id: video.id,
        filename: req.file.originalname,
        originalName: req.file.originalname,  // Add originalName for compatibility
        path: urlData.publicUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: video.created_at,
      },
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      details: error.message,
    });
  }
});

// GET /api/upload/videos - Get all videos
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const videos = await videoService.getAllVideos();
    res.json({ success: true, videos });
  } catch (error: any) {
    console.error('❌ Error fetching videos:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      details: error.message,
    });
  }
});

// GET /api/upload/:id - Get video by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const video: any = await videoService.getVideoById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ success: true, video });
  } catch (error: any) {
    console.error('❌ Error fetching video:', error);
    res.status(500).json({
      error: 'Failed to fetch video',
      details: error.message,
    });
  }
});

// DELETE /api/upload/:id - Delete video
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const video: any = await videoService.getVideoById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from storage
    if (video.storage_path) {
      const { error: deleteError } = await supabase.storage
        .from('video')
        .remove([video.storage_path]);

      if (deleteError) {
        console.error('⚠️ Storage deletion warning:', deleteError);
      }
    }

    // Delete from database
    await videoService.deleteVideo(req.params.id);

    console.log('✅ Video deleted:', req.params.id);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete video',
      details: error.message,
    });
  }
});

export default router;
