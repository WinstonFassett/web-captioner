import { Caption } from '../stores/captionStore';

export const generateTranscriptText = (captions: Caption[]): string => {
  return captions.map(caption => 
    `[${caption.timestamp.toLocaleTimeString()}] ${caption.text}`
  ).join('\n');
};

export const generateFullTranscript = (captions: Caption[]): string => {
  return captions.map(caption => caption.text).join(' ');
};

export const exportTranscript = (captions: Caption[], filename?: string) => {
  const text = generateTranscriptText(captions);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `captions-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};