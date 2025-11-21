import { supabase } from '../config/supabase';

export class VideoService {
  async createVideo(data: {
    original_filename: string;
    file_path: string;
    storage_path?: string;
    status: string;
  }) {
    const { data: video, error } = await supabase
      .from('videos')
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Failed to create video: ${error.message}`);
    return video;
  }

  async getVideoById(id: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get video: ${error.message}`);
    }
    return data;
  }

  async getAllVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get videos: ${error.message}`);
    return data || [];
  }

  async updateVideoStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('videos')
      // @ts-ignore - supabase generic typing mismatch for update payload
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update video status: ${error.message}`);
    return data;
  }

  async deleteVideo(id: string) {
    const { error} = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete video: ${error.message}`);
  }
}
