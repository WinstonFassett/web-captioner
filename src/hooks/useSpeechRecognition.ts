import { useEffect, useRef } from 'react';
import { useCaptionStore } from '../stores/captionStore';
import { useRecordingStore } from '../stores/recordingStore';
import { useSettingsStore } from '../stores/settingsStore';

export const useSpeechRecognition = () => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserInitiatedRef = useRef(false);
  const isRestartingRef = useRef(false);

  const { addCaption, setCurrentCaption } = useCaptionStore();
  const { 
    isListening, 
    hasUserInitiatedRecording, 
    setListening, 
    setRestarting, 
    setUserInitiated, 
    setError, 
    setSupported 
  } = useRecordingStore();
  const { language } = useSettingsStore();

  useEffect(() => {
    hasUserInitiatedRef.current = hasUserInitiatedRecording;
  }, [hasUserInitiatedRecording]);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onstart = () => {
      console.log('Recognition started');
      setListening(true);
      setRestarting(false);
      setError(null);
    };
    
    recognition.onend = () => {
      console.log('Recognition ended. hasUserInitiated:', hasUserInitiatedRef.current, 'isRestarting:', isRestartingRef.current);
      setListening(false);
      setRestarting(false);
      isRestartingRef.current = false;
      
      // If user initiated recording and we should be listening, restart
      if (hasUserInitiatedRef.current) {
        console.log('Attempting to restart recording...');
        setRestarting(true);
        isRestartingRef.current = true;
        
        // Clear any existing restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        // Attempt restart after brief delay
        restartTimeoutRef.current = setTimeout(() => {
          console.log('Executing restart...');
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (error) {
            console.error('Restart failed:', error);
            setRestarting(false);
            isRestartingRef.current = false;
            setError('Failed to restart recording');
          }
        }, 500);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.log('Recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Let onend handle the restart for no-speech errors
        return;
      } else if (event.error === 'aborted') {
        // User manually stopped, don't restart
        setRestarting(false);
        isRestartingRef.current = false;
        return;
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied');
        setUserInitiated(false);
        hasUserInitiatedRef.current = false;
        setRestarting(false);
        isRestartingRef.current = false;
      } else {
        setError(`Speech recognition error: ${event.error}`);
        setRestarting(false);
        isRestartingRef.current = false;
      }
    };
    
    recognition.onresult = (event: any) => {
      console.log('Recognition result received');
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        addCaption(finalTranscript);
      } else if (interimTranscript) {
        setCurrentCaption(interimTranscript);
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [language, addCaption, setCurrentCaption, setListening, setRestarting, setUserInitiated, setError, setSupported]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      console.log('User starting recording');
      setUserInitiated(true);
      hasUserInitiatedRef.current = true;
      setRestarting(false);
      isRestartingRef.current = false;
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start speech recognition');
      }
    }
  };

  const stopListening = () => {
    console.log('User stopping recording');
    if (recognitionRef.current && isListening) {
      setUserInitiated(false);
      hasUserInitiatedRef.current = false;
      setRestarting(false);
      isRestartingRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  return {
    startListening,
    stopListening
  };
};