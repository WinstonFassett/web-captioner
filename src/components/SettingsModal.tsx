import React from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    fontSize, 
    autoScroll, 
    showTimestamps,
    setLanguage,
    setFontSize,
    setAutoScroll,
    setShowTimestamps
  } = useSettingsStore();

  if (!isOpen) return null;

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400 transition-colors duration-200"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-800">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Font Size
            </label>
            <div className="flex space-x-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 capitalize ${
                    fontSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Scroll */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80">
              Auto Scroll
            </label>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                autoScroll ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  autoScroll ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Timestamps */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80">
              Show Timestamps
            </label>
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                showTimestamps ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  showTimestamps ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};