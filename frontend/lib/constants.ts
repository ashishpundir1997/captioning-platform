// Normalize API base URL: allow plain domain without protocol
const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export const API_BASE_URL = rawApi.startsWith('http://') || rawApi.startsWith('https://')
  ? rawApi
  : `https://${rawApi}`;

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  GENERATE_CAPTIONS: `${API_BASE_URL}/api/captions/generate`,
  SAVE_CAPTIONS: `${API_BASE_URL}/api/captions/save`,
  GET_CAPTIONS: (filename: string) => `${API_BASE_URL}/api/captions/${filename}`,
  RENDER_VIDEO: `${API_BASE_URL}/api/render/export`,
};

export interface Caption {
  id: number;
  start: number;
  end: number;
  text: string;
}

export type CaptionStyle = 'bottom' | 'top' | 'karaoke';
