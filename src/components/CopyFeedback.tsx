import React from 'react';
import { useCaptionStore } from '../stores/captionStore';

export const CopyFeedback: React.FC = () => {
  const { copyFeedback } = useCaptionStore();

  if (!copyFeedback) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
      {copyFeedback}
    </div>
  );
};