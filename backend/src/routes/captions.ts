import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { transcribeVideo } from '../services/whisperService';
import { CaptionService } from '../services/captionService';
import { VideoService } from '../services/videoService';
import { supabase } from '../config/supabase';

const router = Router();
const captionService = new CaptionService();
const videoService = new VideoService();

export interface Caption {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface CaptionResponse {
  success: boolean;
  captions: Caption[];
  language?: string;
  duration?: number;
}

// POST /api/captions/generate - Generate captions from video
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { videoId, language } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Get video from database
    const video: any = await videoService.getVideoById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    console.log('🎬 Starting transcription for video:', videoId);
    console.log('🗣️  Language mode:', language || 'auto-detect (supports multiple languages)');

    // For Supabase Storage, we need to download the file temporarily for transcription
    // OR pass the public URL directly to AssemblyAI if it supports URLs
    
    // Download video from Supabase Storage temporarily
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('video')
      .download(video.storage_path!);
    
    if (downloadError || !fileData) {
      throw new Error(`Failed to download video: ${downloadError?.message}`);
    }

    // Save temporarily for transcription
    const tempPath = path.join(__dirname, '../../uploads', `temp-${Date.now()}.mp4`);
    await fs.ensureDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, Buffer.from(await fileData.arrayBuffer()));

    try {
      // Call AssemblyAI API for transcription
      const transcription = await transcribeVideo(tempPath, language);

      console.log('✅ Transcription completed');
      console.log('📝 Generated', transcription.captions.length, 'caption segments');

      // Save captions to database
      const savedCaption: any = await captionService.createCaption({
        video_id: videoId,
        caption_data: transcription.captions,
        style: 'bottom',  // Use 'bottom', 'top', or 'karaoke' - matches DB constraint
        language: transcription.language || language || 'en',
      });

      res.json({
        success: true,
        captions: transcription.captions,
        language: transcription.language,
        duration: transcription.duration,
        captionId: savedCaption?.id,
      });
    } finally {
      // Clean up temp file
      await fs.remove(tempPath);
    }
  } catch (error: any) {
    console.error('❌ Caption generation error:', error);
    res.status(500).json({
      error: 'Failed to generate captions',
      details: error.message,
    });
  }
});

// POST /api/captions/save - Save/update captions
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { videoId, captions, captionId } = req.body;

    if (!videoId || !captions) {
      return res.status(400).json({ error: 'Video ID and captions are required' });
    }

    let savedCaption: any;
    
    if (captionId) {
      // Update existing captions
      savedCaption = await captionService.updateCaptionData(captionId, captions);
    } else {
      // Create new captions
      savedCaption = await captionService.createCaption({
        video_id: videoId,
        caption_data: captions,
        style: 'bottom',  // Use 'bottom', 'top', or 'karaoke' - matches DB constraint
        language: 'en',  // Default language, can be made dynamic
      });
    }

    console.log('💾 Captions saved to database for video:', videoId);

    res.json({
      success: true,
      message: 'Captions saved successfully',
      captionId: savedCaption?.id,
    });
  } catch (error: any) {
    console.error('Save captions error:', error);
    res.status(500).json({
      error: 'Failed to save captions',
      details: error.message,
    });
  }
});

// GET /api/captions/:videoId - Load saved captions
router.get('/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const captions: any = await captionService.getCaptionsByVideoId(videoId);

    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'Captions not found' });
    }

    // Return the most recent caption
    const latestCaption: any = captions[0];

    res.json({
      success: true,
      captions: latestCaption.caption_data,
      captionId: latestCaption.id,
      style: latestCaption.style,
      language: latestCaption.language,
    });
  } catch (error: any) {
    console.error('Load captions error:', error);
    res.status(500).json({
      error: 'Failed to load captions',
      details: error.message,
    });
  }
});

export default router;
