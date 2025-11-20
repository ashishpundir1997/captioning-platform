import { useRef, ChangeEvent } from 'react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUpload({ onUpload, disabled }: VideoUploadProps) {
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
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="btn-upload"
      >
        {disabled ? '✅ Video Uploaded' : '📁 Choose Video File (.mp4)'}
      </button>
      <p className="upload-note">
        Supported formats: MP4, MPEG, MOV | Max size: 100MB
      </p>
    </div>
  );
}
