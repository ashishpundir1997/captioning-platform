import { useRef, ChangeEvent } from 'react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean; // disabled after successful upload
  isLoading?: boolean; // loading while upload in progress
}

export default function VideoUpload({ onUpload, disabled, isLoading }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2 style={{ color: 'var(--text-color)' }}>Video Upload</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/mpeg,video/quicktime"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isLoading}
      />
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="btn-upload"
      >
        {isLoading && !disabled && (
          <span className="spinner" aria-hidden="true"></span>
        )}
        {disabled
          ? '✅ Video Uploaded'
          : isLoading
            ? 'Uploading...'
            : '📁 Choose Video File (.mp4)'}
      </button>
      <p className="upload-note">
        Supported formats: MP4, MPEG, MOV | Max size: 100MB
      </p>
    </div>
  );
}
