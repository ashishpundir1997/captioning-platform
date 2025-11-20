import { useState } from 'react';
import Head from 'next/head';
import { uploadVideo, generateCaptions, saveCaptions } from '@/lib/api';
import { Caption, CaptionStyle } from '@/lib/constants';
import VideoUpload from '@/components/VideoUpload';
import VideoPreview from '@/components/VideoPreview';
import CaptionEditor from '@/components/CaptionEditor';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{
    videoId: string;
    filename: string;
    originalName: string;
    path: string;
  } | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('bottom');
  const [error, setError] = useState<string | null>(null);
  const [captionId, setCaptionId] = useState<string | null>(null);

  const handleVideoUpload = async (file: File) => {
    try {
      setError(null);
      setIsUploading(true);
      console.log('Uploading video:', file.name);
      
      const response = await uploadVideo(file);
      
      if (response.success) {
        console.log('Upload response:', response); // Debug log
        setUploadedFile({
          videoId: response.videoId || response.file.id || '', // Use videoId or file.id from Supabase
          filename: response.file.filename,
          originalName: response.file.originalName || response.file.filename,
          path: response.publicUrl || response.file.path, // Use publicUrl from Supabase
        });
        console.log('Video uploaded successfully. ID:', response.videoId || response.file.id);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload video');
    }
    finally {
      setIsUploading(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!uploadedFile) return;

    try {
      setError(null);
      setIsGenerating(true);
      console.log('Generating captions for video ID:', uploadedFile.videoId);
      
      const response = await generateCaptions(uploadedFile.videoId);
      
      if (response.success) {
        setCaptions(response.captions);
        console.log('Generated', response.captions.length, 'captions');
        console.log('Detected language:', response.language);
        
        // Auto-save captions
        const saveResponse = await saveCaptions(uploadedFile.videoId, response.captions);
        if (saveResponse.captionId) {
          setCaptionId(saveResponse.captionId);
        }
      }
    } catch (err: any) {
      console.error('Caption generation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate captions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCaptionsUpdate = (updatedCaptions: Caption[]) => {
    setCaptions(updatedCaptions);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setCaptions([]);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Remotion Video Captioning Platform</title>
        <meta name="description" content="AI-powered video captioning with Remotion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        <header>
          <h1>🎬 Video Captioning Platform</h1>
          <p>Upload your video and generate AI-powered captions with Hinglish support</p>
        </header>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="workflow">
          {/* Step 1: Upload */}
          <section className="step">
            <h2>Step 1: Upload Video</h2>
            <VideoUpload onUpload={handleVideoUpload} disabled={!!uploadedFile} isLoading={isUploading} />
            {uploadedFile && (
              <div className="upload-success">
                ✅ Uploaded: <strong>{uploadedFile.originalName}</strong>
                <button onClick={handleReset} className="btn-secondary">
                  Upload Different Video
                </button>
              </div>
            )}
          </section>

          {/* Step 2: Generate Captions */}
          {uploadedFile && (
            <section className="step">
              <h2>Step 2: Generate Captions</h2>
              <div className="caption-controls">
                <button
                  onClick={handleGenerateCaptions}
                  disabled={isGenerating || captions.length > 0}
                  className="btn-primary"
                >
                  {isGenerating && <span className="spinner" aria-hidden="true"></span>}
                  {isGenerating ? 'Generating Captions...' : '🤖 Auto-Generate Captions'}
                </button>
                
                {captions.length > 0 && (
                  <div className="caption-info">
                    ✅ Generated {captions.length} caption segments
                  </div>
                )}
              </div>

              {isGenerating && (
                <div className="loading">
                  <p>🎤 Transcribing audio with OpenAI Whisper...</p>
                  <p className="note">This may take a minute depending on video length</p>
                </div>
              )}
            </section>
          )}

          {/* Step 3: Preview & Style */}
          {uploadedFile && captions.length > 0 && (
            <>
              <section className="step">
                <h2>Step 3: Select Caption Style</h2>
                <div className="style-selector">
                  <button
                    className={`style-btn ${captionStyle === 'bottom' ? 'active' : ''}`}
                    onClick={() => setCaptionStyle('bottom')}
                  >
                    Bottom
                  </button>
                  <button
                    className={`style-btn ${captionStyle === 'top' ? 'active' : ''}`}
                    onClick={() => setCaptionStyle('top')}
                  >
                    Top
                  </button>
                  <button
                    className={`style-btn ${captionStyle === 'karaoke' ? 'active' : ''}`}
                    onClick={() => setCaptionStyle('karaoke')}
                  >
                    Karaoke
                  </button>
                </div>
              </section>

              <section className="step">
                <h2>Step 4: Preview & Export</h2>
                <VideoPreview
                  filename={uploadedFile.filename}
                  videoId={uploadedFile.videoId}
                  videoUrl={uploadedFile.path}
                  captions={captions}
                  style={captionStyle}
                />
              </section>

              <section className="step">
                <h2>Edit Captions</h2>
                <CaptionEditor
                  captions={captions}
                  onUpdate={handleCaptionsUpdate}
                />
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
