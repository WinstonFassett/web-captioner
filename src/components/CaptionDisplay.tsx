import React from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useCaptionStore } from '../stores/captionStore';
import { useRecordingStore } from '../stores/recordingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { CaptionItem } from './CaptionItem';

export const CaptionDisplay: React.FC = () => {
  const { captions, currentCaption } = useCaptionStore();
  const { error, hasUserInitiatedRecording } = useRecordingStore();
  const { fontSize, autoScroll } = useSettingsStore();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xl md:text-2xl lg:text-3xl';
      case 'medium': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'large': return 'text-3xl md:text-4xl lg:text-5xl';
      default: return 'text-3xl md:text-4xl lg:text-5xl';
    }
  };

  return (
    <ScrollToBottom 
      className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-4 overflow-x-hidden" 
      followButtonClassName="hidden"
      scrollViewClassName="h-full"
      mode={autoScroll ? "bottom" : "top"}>
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      {captions.length === 0 && !currentCaption && (
        <div className="text-center py-12 text-white/40">
          <Mic className="w-20 h-20 mx-auto mb-6" />
          <p className="text-2xl font-light">
            {!hasUserInitiatedRecording 
              ? 'Press record to start captioning' 
              : 'Start speaking to see live captions'
            }
          </p>
        </div>
      )}

      <div className={getFontSizeClass()}>
        {captions.map((caption, index) => (
          <CaptionItem 
            key={caption.id}
            caption={caption}
            index={index}
            totalCaptions={captions.length}
          />
        ))}
        {currentCaption && (
          <CaptionItem 
            caption={{ 
              id: 'current', 
              text: currentCaption, 
              timestamp: new Date(),
              isFinal: false
            }}
            index={captions.length}
            totalCaptions={captions.length + 1}
          />
        )}
      </div>
    </ScrollToBottom>
  );
};