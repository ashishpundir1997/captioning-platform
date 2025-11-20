export interface Caption {
  id: number;
  start: number;
  end: number;
  text: string;
}

export type CaptionStyle = 'bottom' | 'top' | 'karaoke';
