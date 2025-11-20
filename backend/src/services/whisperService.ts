import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { Caption } from '../routes/captions';

const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com';

interface TranscriptionResult {
  captions: Caption[];
  language: string;
  duration: number;
}

/**
 * Upload video file to AssemblyAI
 */
async function uploadVideoToAssemblyAI(videoPath: string): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY is not set in environment variables');
  }

  console.log('📤 Uploading video to AssemblyAI...');

  const audioData = await fs.readFile(videoPath);
  const uploadResponse = await axios.post(
    `${ASSEMBLYAI_BASE_URL}/v2/upload`,
    audioData,
    {
      headers: {
        authorization: apiKey,
      },
    }
  );

  console.log('✅ Video uploaded to AssemblyAI');
  return uploadResponse.data.upload_url;
}

/**
 * Transcribe video using AssemblyAI API
 * Supports multiple languages including Hindi and Hinglish
 */
export async function transcribeVideo(
  videoPath: string,
  language?: string
): Promise<TranscriptionResult> {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY is not set in environment variables');
    }

    // Upload the video file
    const audioUrl = await uploadVideoToAssemblyAI(videoPath);

    // Start transcription
    console.log('🎬 Starting transcription...');
    const transcriptResponse = await axios.post(
      `${ASSEMBLYAI_BASE_URL}/v2/transcript`,
      {
        audio_url: audioUrl,
        speech_model: 'universal',
        language_code: language || 'en', // Default to English, supports 'hi' for Hindi
      },
      {
        headers: {
          authorization: apiKey,
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;
    const pollingEndpoint = `${ASSEMBLYAI_BASE_URL}/v2/transcript/${transcriptId}`;

    console.log('⏳ Waiting for transcription to complete...');

    // Poll for completion
    let transcriptionResult;
    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, {
        headers: {
          authorization: apiKey,
        },
      });
      
      transcriptionResult = pollingResponse.data;

      if (transcriptionResult.status === 'completed') {
        console.log('✅ Transcription completed!');
        break;
      } else if (transcriptionResult.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      } else {
        console.log(`⏳ Status: ${transcriptionResult.status}...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Process the transcription into caption format
    const captions: Caption[] = [];
    
    // AssemblyAI provides words with timestamps
    if (transcriptionResult.words && Array.isArray(transcriptionResult.words)) {
      // Group words into sentences/segments (every 10 words or by punctuation)
      const wordsPerSegment = 10;
      const words = transcriptionResult.words;
      
      for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segmentWords = words.slice(i, i + wordsPerSegment);
        if (segmentWords.length > 0) {
          captions.push({
            id: Math.floor(i / wordsPerSegment) + 1,
            start: segmentWords[0].start / 1000, // Convert ms to seconds
            end: segmentWords[segmentWords.length - 1].end / 1000,
            text: segmentWords.map((w: any) => w.text).join(' '),
          });
        }
      }
    } else {
      // Fallback: create a single caption with full text
      captions.push({
        id: 1,
        start: 0,
        end: transcriptionResult.audio_duration || 0,
        text: transcriptionResult.text || '',
      });
    }

    return {
      captions,
      language: transcriptionResult.language_code || language || 'unknown',
      duration: transcriptionResult.audio_duration || 0,
    };
  } catch (error: any) {
    console.error('AssemblyAI API error:', error);
    
    if (error.code === 'ENOENT') {
      throw new Error('Video file not found');
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Invalid AssemblyAI API key. Please check your ASSEMBLYAI_API_KEY in .env file');
    }
    
    if (error.code === 'ECONNRESET' || error.message?.includes('Connection error')) {
      throw new Error('Failed to connect to AssemblyAI API. Please check your internet connection and API key.');
    }
    
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Alternative: Split long captions into shorter segments for better display
 */
export function splitCaptions(captions: Caption[], maxDuration: number = 5): Caption[] {
  const splitCaptions: Caption[] = [];
  let captionId = 1;

  captions.forEach((caption) => {
    const duration = caption.end - caption.start;

    if (duration <= maxDuration) {
      // Caption is short enough, keep as is
      splitCaptions.push({
        ...caption,
        id: captionId++,
      });
    } else {
      // Split long caption into smaller segments
      const words = caption.text.split(' ');
      const wordsPerSegment = Math.ceil(words.length / Math.ceil(duration / maxDuration));
      const segmentDuration = duration / Math.ceil(words.length / wordsPerSegment);

      for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segmentWords = words.slice(i, i + wordsPerSegment);
        const segmentStart = caption.start + (i / words.length) * duration;
        const segmentEnd = Math.min(
          caption.start + ((i + wordsPerSegment) / words.length) * duration,
          caption.end
        );

        splitCaptions.push({
          id: captionId++,
          start: segmentStart,
          end: segmentEnd,
          text: segmentWords.join(' '),
        });
      }
    }
  });

  return splitCaptions;
}

/**
 * Format captions for Remotion consumption
 */
export function formatCaptionsForRemotion(captions: Caption[]) {
  return captions.map((caption) => ({
    id: caption.id,
    startFrame: Math.floor(caption.start * 30), // Assuming 30 FPS
    endFrame: Math.floor(caption.end * 30),
    startTime: caption.start,
    endTime: caption.end,
    text: caption.text,
  }));
}
