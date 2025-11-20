-- =============================================
-- Remotion Captioning Platform Database Schema
-- =============================================
-- Created: 2025-11-20
-- Description: Initial database schema for video captioning platform
-- with Supabase integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE video_status AS ENUM ('uploaded', 'transcribing', 'transcribed', 'error');
CREATE TYPE caption_style AS ENUM ('bottom', 'top', 'karaoke');
CREATE TYPE export_status AS ENUM ('queued', 'rendering', 'completed', 'failed');

-- =============================================
-- TABLES
-- =============================================

-- Videos Table
-- Stores metadata about uploaded videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_size BIGINT,
  duration FLOAT,
  mime_type TEXT,
  status video_status DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Captions Table
-- Stores caption data for videos
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  caption_data JSONB NOT NULL,
  style caption_style DEFAULT 'bottom',
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exports Table
-- Tracks rendered videos with burned-in captions
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  caption_id UUID REFERENCES captions(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_size BIGINT,
  status export_status DEFAULT 'queued',
  error_message TEXT,
  render_time INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Videos indexes
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- Captions indexes
CREATE INDEX idx_captions_video_id ON captions(video_id);
CREATE INDEX idx_captions_created_at ON captions(created_at DESC);

-- Exports indexes
CREATE INDEX idx_exports_video_id ON exports(video_id);
CREATE INDEX idx_exports_caption_id ON exports(caption_id);
CREATE INDEX idx_exports_status ON exports(status);
CREATE INDEX idx_exports_created_at ON exports(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_captions_updated_at
  BEFORE UPDATE ON captions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- Captions policies
CREATE POLICY "Users can view captions for their videos"
  ON captions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = captions.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert captions for their videos"
  ON captions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = captions.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update captions for their videos"
  ON captions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = captions.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete captions for their videos"
  ON captions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = captions.video_id
      AND videos.user_id = auth.uid()
    )
  );

-- Exports policies
CREATE POLICY "Users can view exports for their videos"
  ON exports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = exports.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exports for their videos"
  ON exports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = exports.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exports for their videos"
  ON exports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = exports.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exports for their videos"
  ON exports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = exports.video_id
      AND videos.user_id = auth.uid()
    )
  );

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets for videos and exports
-- Run these commands in Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('videos', 'videos', false);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('exports', 'exports', false);

-- Storage policies (add via Supabase Dashboard)
-- Bucket: videos
-- Policy: Users can upload their own videos
-- Policy: Users can view their own videos
-- Policy: Users can delete their own videos

-- Bucket: exports
-- Policy: Users can view their own exports
-- Policy: Service role can upload exports

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE videos IS 'Stores metadata about uploaded videos';
COMMENT ON TABLE captions IS 'Stores caption data and styling preferences for videos';
COMMENT ON TABLE exports IS 'Tracks rendered videos with burned-in captions';

COMMENT ON COLUMN videos.storage_path IS 'Path to video file in Supabase Storage';
COMMENT ON COLUMN videos.status IS 'Current processing status of the video';
COMMENT ON COLUMN captions.caption_data IS 'JSON array of caption objects with start, end, and text';
COMMENT ON COLUMN captions.style IS 'Caption display style preference';
COMMENT ON COLUMN exports.storage_path IS 'Path to rendered video file in Supabase Storage';
COMMENT ON COLUMN exports.render_time IS 'Time taken to render the video in seconds';
