import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Trash2, 
  Download, 
  AlertCircle,
  Copy,
  Edit3,
  Check,
  X,
  ArrowDown,
  Clipboard
} from 'lucide-react';

interface Caption {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [hasUserInitiatedRecording, setHasUserInitiatedRecording] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const captionEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      console.log('Recognition started');
      setIsListening(true);
      setIsRestarting(false);
      setError(null);
    };
    
    recognition.onend = () => {
      console.log('Recognition ended. hasUserInitiated:', hasUserInitiatedRecording, 'isRestarting:', isRestarting);
      setIsListening(false);
      
      // If user initiated recording and we should be listening, restart
      if (hasUserInitiatedRecording && !isRestarting) {
        console.log('Attempting to restart recording...');
        setIsRestarting(true);
        
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
            setIsRestarting(false);
          } catch (error) {
            console.error('Restart failed:', error);
            setIsRestarting(false);
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
        setIsRestarting(false);
        return;
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied');
        setHasUserInitiatedRecording(false);
        setIsRestarting(false);
      } else {
        setError(`Speech recognition error: ${event.error}`);
        setIsRestarting(false);
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
        const newCaption: Caption = {
          id: Date.now().toString(),
          text: finalTranscript,
          timestamp: new Date(),
          isFinal: true
        };
        
        setCaptions(prev => [...prev, newCaption]);
        setCurrentCaption('');
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
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new captions are added
    if (captionEndRef.current) {
      captionEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [captions, currentCaption]);

  useEffect(() => {
    // Focus edit input when editing starts
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      console.log('User starting recording');
      setHasUserInitiatedRecording(true);
      setIsRestarting(false);
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
      setHasUserInitiatedRecording(false);
      setIsRestarting(false);
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

  const clearCaptions = () => {
    setCaptions([]);
    setCurrentCaption('');
    setEditingId(null);
  };

  const exportCaptions = () => {
    const text = captions.map(caption => 
      `[${caption.timestamp.toLocaleTimeString()}] ${caption.text}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, type: 'full' | 'item' = 'item') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(type === 'full' ? 'Full transcript copied!' : 'Text copied!');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const copyFullTranscript = () => {
    const fullText = captions.map(caption => caption.text).join(' ');
    copyToClipboard(fullText, 'full');
  };

  const deleteCaption = (id: string) => {
    setCaptions(prev => prev.filter(caption => caption.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEditing = (caption: Caption) => {
    setEditingId(caption.id);
    setEditText(caption.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setCaptions(prev => prev.map(caption => 
        caption.id === editingId 
          ? { ...caption, text: editText.trim() }
          : caption
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const squashWithNext = (currentIndex: number) => {
    if (currentIndex < captions.length - 1) {
      const currentCaption = captions[currentIndex];
      const nextCaption = captions[currentIndex + 1];
      
      const mergedCaption: Caption = {
        ...currentCaption,
        text: `${currentCaption.text} ${nextCaption.text}`.trim()
      };

      setCaptions(prev => [
        ...prev.slice(0, currentIndex),
        mergedCaption,
        ...prev.slice(currentIndex + 2)
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (!isSupported) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Browser Not Supported</h2>
          <p className="text-white/80">
            This browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Copy feedback */}
      {copyFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
          {copyFeedback}
        </div>
      )}

      {/* Header */}
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
              onClick={copyFullTranscript}
              className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
              title="Copy full transcript"
              disabled={captions.length === 0}
            >
              <Clipboard className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportCaptions}
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
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="relative z-10 h-[calc(100vh-80px)] max-w-6xl mx-auto p-4 flex flex-col overflow-hidden">
        {/* Caption display */}
        <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-4 overflow-y-auto overflow-x-hidden">
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
          
          <div className="space-y-8">
            {captions.map((caption, index) => (
              <div
                key={caption.id}
                className="group animate-fade-in-up hover:bg-white/5 rounded-xl p-4 transition-all duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-white/40 font-mono">
                    {caption.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => copyToClipboard(caption.text)}
                      className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
                      title="Copy text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => startEditing(caption)}
                      className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
                      title="Edit text"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    
                    {index < captions.length - 1 && (
                      <button
                        onClick={() => squashWithNext(index)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all duration-200"
                        title="Merge with next"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteCaption(caption.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {editingId === caption.id ? (
                  <div className="space-y-3">
                    <textarea
                      ref={editInputRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed tracking-wide resize-none focus:outline-none focus:border-blue-400 transition-colors duration-200"
                      rows={Math.max(2, Math.ceil(editText.length / 50))}
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveEdit}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-all duration-200"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed tracking-wide cursor-pointer"
                     onClick={() => startEditing(caption)}>
                    {caption.text}
                  </p>
                )}
              </div>
            ))}
            
            {currentCaption && (
              <div className="p-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-white/40 font-mono">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <p className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed tracking-wide">
                    {currentCaption}
                    <span className="inline-block w-1 h-12 md:h-14 lg:h-16 bg-blue-400 ml-2 opacity-75"></span>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div ref={captionEndRef} />
        </div>

        {/* Recording controls - fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-center space-x-6 pb-4">
          <button
            onClick={(isListening || isRestarting) ? stopListening : startListening}
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
              {!hasUserInitiatedRecording 
                ? 'Press record to start captioning'
                : isRestarting
                  ? 'Restarting recording...'
                  : isListening 
                    ? 'Recording...' 
                    : 'Click to start'
              }
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
      </div>
    </div>
  );
}

export default App;