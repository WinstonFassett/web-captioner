import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useRecordingStore } from '../stores/recordingStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export const RecordingToolbar: React.FC = () => {
  const { isListening, isRestarting, hasUserInitiatedRecording } = useRecordingStore();
  const { startListening, stopListening } = useSpeechRecognition();

  const handleToggleRecording = () => {
    if (isListening || isRestarting) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getStatusText = () => {
    if (!hasUserInitiatedRecording) {
      return 'Press record to start captioning';
    }
    if (isRestarting) {
      return 'Restarting recording...';
    }
    if (isListening) {
      return 'Recording...';
    }
    return 'Click to start';
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-center space-x-6 pb-4">
      <button
        onClick={handleToggleRecording}
        className={`relative p-6 rounded-full transition-all duration-300 transform hover:scale-105 ${
          (isListening || isRestarting)
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
            : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
        }`}
      >
        {(isListening || isRestarting) ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
      
      <div className="text-center">
        <p className="text-white/60 text-lg font-medium">
          {getStatusText()}
        </p>
        {(isListening || isRestarting) && (
          <div className="flex items-center justify-center space-x-1 mt-3 h-8">
            <div className={`w-1.5 h-6 rounded-full opacity-60 ${isRestarting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <div className={`w-1.5 h-8 rounded-full opacity-80 ${isRestarting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <div className={`w-1.5 h-4 rounded-full opacity-60 ${isRestarting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <div className={`w-1.5 h-7 rounded-full opacity-70 ${isRestarting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <div className={`w-1.5 h-5 rounded-full opacity-60 ${isRestarting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
          </div>
        )}
      </div>
    </div>
  );
};