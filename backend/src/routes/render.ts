import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { Caption } from './captions';
import { VideoService } from '../services/videoService';
import { supabase } from '../config/supabase';

const router = Router();
const videoService = new VideoService();

// Cache the bundle location to avoid re-bundling
let cachedBundleLocation: string | null = null;

export interface RenderRequest {
  videoId: string;  // Changed from filename to videoId
  captions: Caption[];
  style: string;
}

// POST /api/render/export - Render video with captions to MP4
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { videoId, captions, style } = req.body as RenderRequest;

    if (!videoId || !captions || !style) {
      return res.status(400).json({ 
        error: 'Video ID, captions, and style are required' 
      });
    }

    // Get video from database
    const video: any = await videoService.getVideoById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    console.log('🎬 Starting FAST video render for:', video.original_filename);
    console.log('📝 Caption count:', captions.length);
    console.log('🎨 Style:', style);

    // Use the Supabase public URL directly
    const videoUrl = video.file_path;
    console.log('📹 Video URL:', videoUrl);

    // Path to the backend's Remotion SOURCE files (bundler needs .ts files, not compiled .js)
    // In production: __dirname = /app/dist/routes, so ../remotion (copied during build)
    // In development: __dirname = /path/backend/dist/routes, so ../../src/remotion
    const srcRemotionPath = path.join(__dirname, '../../src/remotion');
    const distRemotionPath = path.join(__dirname, '../remotion');
    
    // Use src/remotion if it exists (development), otherwise use dist/remotion (production)
    const remotionPath = await fs.pathExists(srcRemotionPath) ? srcRemotionPath : distRemotionPath;
    
    console.log('🔍 Remotion path check:');
    console.log('  __dirname:', __dirname);
    console.log('  srcRemotionPath:', srcRemotionPath, '- exists:', await fs.pathExists(srcRemotionPath));
    console.log('  distRemotionPath:', distRemotionPath, '- exists:', await fs.pathExists(distRemotionPath));
    console.log('  Using:', remotionPath);
    
    // Verify the entry point exists
    const entryPoint = path.join(remotionPath, 'index.ts');
    if (!await fs.pathExists(entryPoint)) {
      throw new Error(`Remotion entry point not found at ${entryPoint}. Make sure Remotion files are copied during build.`);
    }
    
    const outputFileName = `${video.original_filename.replace(/\.[^/.]+$/, '')}-captioned-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, '../../uploads', outputFileName);

    // Ensure uploads directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Bundle the Remotion project (with caching for SPEED)
    let bundleLocation: string;
    
    if (cachedBundleLocation && await fs.pathExists(cachedBundleLocation)) {
      console.log('⚡ Using cached bundle (FAST!)');
      bundleLocation = cachedBundleLocation;
    } else {
      console.log('📦 Bundling Remotion project (first time only)...');
      bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
      });
      cachedBundleLocation = bundleLocation;
      console.log('✅ Bundle created and cached for future renders');
    }

    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'VideoWithCaptions',
      inputProps: {
        videoSrc: videoUrl,  // Use Supabase public URL
        captions,
        style,
      },
    });

    console.log('🎥 Composition selected:', composition.id);
    console.log('⏱️  Duration:', composition.durationInFrames, 'frames');
    console.log('📐 Dimensions:', composition.width, 'x', composition.height);

    // Render the video with MAXIMUM SPEED optimizations
    console.log('🎬 Rendering video with SPEED optimizations...');
    const startTime = Date.now();
    
    // Set Chrome flags for production/Railway environment
    const isProduction = process.env.NODE_ENV === 'production';
    const chromeFlags = isProduction ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ] : [];
    
    // Set environment variables for Chrome
    if (isProduction && chromeFlags.length > 0) {
      process.env.CHROMIUM_FLAGS = chromeFlags.join(' ');
    }
    
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoSrc: videoUrl,
        captions,
        style,
      },
      // MAXIMUM PERFORMANCE SETTINGS
      concurrency: isProduction ? 2 : 8,  // Lower concurrency in production to avoid memory issues
      imageFormat: 'jpeg',
      jpegQuality: 80,
      enforceAudioTrack: false,  // Skip if no audio needed
      chromiumOptions: {
        gl: isProduction ? 'swiftshader' : 'angle',  // Use swiftshader in production (no GPU)
        headless: true,
        ignoreCertificateErrors: true,
      },
      // Chrome flags for Railway/Docker environments
      puppeteerInstance: undefined,
      browserExecutable: undefined,
      // Faster encoding settings
      videoBitrate: '5M',  // Lower bitrate = faster encoding
      scale: 1,  // No scaling
      muted: false,
      numberOfGifLoops: null,
      everyNthFrame: 1,  // Render every frame
      frameRange: null,
      envVariables: {},
      onProgress: ({ progress, renderedFrames, encodedFrames, stitchStage }) => {
        const percent = (progress * 100).toFixed(1);
        if (renderedFrames % 30 === 0 || progress === 1) {  // Log every 30 frames
          console.log(`⚡ ${stitchStage === 'encoding' ? 'Encoding' : 'Rendering'}: ${percent}% (${renderedFrames}/${composition.durationInFrames} frames)`);
        }
      },
    });

    const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Video rendered in ${renderTime}s!`);
    console.log('📦 Bundle kept in cache for next render');

    // NO SUPABASE UPLOAD - Just serve directly from local file for speed
    res.json({
      success: true,
      message: 'Video rendered successfully',
      filename: outputFileName,
      path: `/uploads/${outputFileName}`,
      downloadUrl: `http://localhost:${process.env.BACKEND_PORT || 5000}/uploads/${outputFileName}`,
    });
  } catch (error: any) {
    console.error('❌ Render error:', error);
    res.status(500).json({
      error: 'Failed to render video',
      details: error.message,
    });
  }
});

export default router;
