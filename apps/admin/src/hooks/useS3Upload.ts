import { useState } from 'react';
import { projectsApi } from '@/lib/api';

export function useS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    try {
      const { uploadUrl, fileUrl } = await projectsApi.presign(file.name, file.type);
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      setProgress(100);
      return fileUrl;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
