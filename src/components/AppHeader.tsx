import React from 'react';
import { Mic, Download, Trash2, Clipboard, Settings } from 'lucide-react';
import { useCaptionStore } from '../stores/captionStore';
import { exportTranscript, generateFullTranscript, copyToClipboard, generateTranscriptText } from '../utils/textUtils';

interface AppHeaderProps {
  onSettingsClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsClick }) => {
  const { captions, setCopyFeedback, clearCaptions } = useCaptionStore();

  const handleExport = () => {
    exportTranscript(captions);
  };

  const handleCopyFullTranscript = async () => {
    const fullText = generateTranscriptText(captions);
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopyFeedback('Full transcript copied!');
    } else {
      setCopyFeedback('Failed to copy transcript');
    }
  };

  return (
    <header className="relative z-10 p-4 bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Live Captioner</h1>
            <p className="text-white/60 text-xs">Real-time speech recognition</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyFullTranscript}
            className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
            title="Copy full transcript"
            disabled={captions.length === 0}
          >
            <Clipboard className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            title="Export captions"
            disabled={captions.length === 0}
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={clearCaptions}
            className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            title="Clear all captions"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};