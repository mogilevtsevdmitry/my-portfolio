import { useRef, useState } from 'react';
import { useS3Upload } from '@/hooks/useS3Upload';

interface MediaUploadProps {
  value?: string;
  mediaType?: string;
  onChange: (url: string, type: 'image' | 'video') => void;
  label?: string;
}

export function MediaUpload({ value, mediaType, onChange, label = 'Preview' }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useS3Upload();
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    try {
      const url = await upload(file);
      onChange(url, type);
    } catch {
      setError('Upload failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </label>
      <div
        className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--border-hover)] transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="py-6 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
          </div>
        ) : value ? (
          <div className="space-y-2">
            {mediaType === 'video' ? (
              <video src={value} className="max-h-40 mx-auto rounded-lg" controls />
            ) : (
              <img src={value} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
            )}
            <p className="text-xs text-[var(--text-muted)]">Click to replace</p>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-1">
            <p className="text-[var(--text-muted)] text-sm">Drag & drop or click to upload</p>
            <p className="text-xs text-[var(--text-muted)] opacity-60">JPG, PNG, WebP, GIF, MP4, WebM</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
