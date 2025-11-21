import { supabase } from '../config/supabase';

export class CaptionService {
  async createCaption(data: {
    video_id: string;
    caption_data: any;
    style: string;
    language: string;
  }) {
    const { data: caption, error } = await supabase
      .from('captions')
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Failed to create caption: ${error.message}`);
    return caption;
  }

  async getCaptionsByVideoId(videoId: string) {
    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get captions: ${error.message}`);
    return data || [];
  }

  async updateCaptionStyle(id: string, style: string) {
    const { data, error } = await supabase
      .from('captions')
      // @ts-ignore - supabase generic typing mismatch for update payload
      .update({ style })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update caption style: ${error.message}`);
    return data;
  }

  async updateCaptionData(id: string, captionData: any) {
    const { data, error } = await supabase
      .from('captions')
      // @ts-ignore - supabase generic typing mismatch for update payload
      .update({ caption_data: captionData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update caption data: ${error.message}`);
    return data;
  }
}
