import axios from 'axios';
import { API_ENDPOINTS, Caption } from './constants';

export interface UploadResponse {
  success: boolean;
  message: string;
  file: {
    id?: string;  // Video ID from Supabase
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  };
  // New Supabase fields
  videoId?: string;
  publicUrl?: string;
}

export interface CaptionResponse {
  success: boolean;
  captions: Caption[];
  language?: string;
  duration?: number;
}

/**
 * Upload video file to backend
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await axios.post(API_ENDPOINTS.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Generate captions for uploaded video
 */
export async function generateCaptions(
  videoId: string,
  language?: string
): Promise<CaptionResponse> {
  const response = await axios.post(API_ENDPOINTS.GENERATE_CAPTIONS, {
    videoId,
    language,
  });

  return response.data;
}

/**
 * Save captions to database
 */
export async function saveCaptions(
  videoId: string,
  captions: Caption[],
  captionId?: string
): Promise<{ success: boolean; message: string; captionId: string }> {
  const response = await axios.post(API_ENDPOINTS.SAVE_CAPTIONS, {
    videoId,
    captions,
    captionId,
  });

  return response.data;
}

/**
 * Get saved captions
 */
export async function getCaptions(filename: string): Promise<CaptionResponse> {
  const response = await axios.get(API_ENDPOINTS.GET_CAPTIONS(filename));
  return response.data;
}

/**
 * Render video with captions
 */
export async function renderVideo(
  videoId: string,
  captions: Caption[],
  style: string
): Promise<{ success: boolean; message: string; filename: string; downloadUrl: string }> {
  const response = await axios.post(API_ENDPOINTS.RENDER_VIDEO, {
    videoId,
    captions,
    style,
  });

  return response.data;
}
