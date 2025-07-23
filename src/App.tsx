import React, { useState, useEffect } from 'react';
import { useRecordingStore } from './stores/recordingStore';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { AppHeader } from './components/AppHeader';
import { CaptionDisplay } from './components/CaptionDisplay';
import { RecordingToolbar } from './components/RecordingToolbar';
import { SettingsModal } from './components/SettingsModal';
import { CopyFeedback } from './components/CopyFeedback';
import { UnsupportedBrowser } from './components/UnsupportedBrowser';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { isSupported, hasUserInitiatedRecording } = useRecordingStore();
  
  // Initialize speech recognition
  const { startListening } = useSpeechRecognition();

  // Auto-start recording if user had it enabled previously
  useEffect(() => {
    if (isSupported && hasUserInitiatedRecording) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        startListening();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, hasUserInitiatedRecording, startListening]);

  if (!isSupported) {
    return <UnsupportedBrowser />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <CopyFeedback />
      
      <AppHeader onSettingsClick={() => setShowSettings(true)} />

      <div className="relative z-10 h-[calc(100vh-80px)] max-w-6xl mx-auto p-4 flex flex-col overflow-hidden">
        <CaptionDisplay />
        <RecordingToolbar />
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default App;