import { supabase } from '../config/supabase';

export class ExportService {
  async createExport(data: {
    video_id: string;
    file_path: string;
    storage_path?: string;
    status: string;
  }) {
    const { data: exportRecord, error } = await supabase
      .from('exports')
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Failed to create export: ${error.message}`);
    return exportRecord;
  }

  async updateExportStatus(id: string, status: string, errorMessage?: string) {
    const { data, error } = await supabase
      .from('exports')
      // @ts-expect-error - Supabase type mismatch
      .update({ 
        status,
        error_message: errorMessage || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update export status: ${error.message}`);
    return data;
  }

  async updateExportPath(id: string, filePath: string, storagePath?: string) {
    const { data, error } = await supabase
      .from('exports')
      // @ts-expect-error - Supabase type mismatch
      .update({ 
        file_path: filePath,
        storage_path: storagePath,
        status: 'completed',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update export path: ${error.message}`);
    return data;
  }

  async getExportsByVideoId(videoId: string) {
    const { data, error } = await supabase
      .from('exports')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get exports: ${error.message}`);
    return data || [];
  }
}
