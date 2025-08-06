import React, { useRef, useEffect } from 'react';
import { Copy, Edit3, Check, X, ArrowDown, Trash2 } from 'lucide-react';
import { Caption, useCaptionStore } from '../stores/captionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { copyToClipboard } from '../utils/textUtils';

interface CaptionItemProps {
  caption: Caption;
  index: number;
  totalCaptions: number;
}

export const CaptionItem: React.FC<CaptionItemProps> = ({ caption, index, totalCaptions }) => {
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    editingId, 
    editText, 
    startEditing, 
    saveEdit, 
    cancelEdit, 
    deleteCaption, 
    squashWithNext, 
    setCopyFeedback 
  } = useCaptionStore();
  
  const { fontSize, showTimestamps } = useSettingsStore();

  const isEditing = editingId === caption.id;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    const success = await copyToClipboard(caption.text);
    if (success) {
      setCopyFeedback('Text copied!');
    } else {
      setCopyFeedback('Failed to copy text');
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

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xl md:text-2xl lg:text-3xl';
      case 'medium': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'large': return 'text-3xl md:text-4xl lg:text-5xl';
      default: return 'text-3xl md:text-4xl lg:text-5xl';
    }
  };

  return (
    <div
      className="group animate-fade-in-up hover:bg-white/5 rounded-xl p-4 transition-all duration-200"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-2">
        {showTimestamps && (
          <span className="text-sm text-white/40 font-mono">
            {caption.timestamp.toLocaleTimeString()}
          </span>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
            title="Copy text"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => startEditing(caption)}
            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
            title="Edit text"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          {index < totalCaptions - 1 && (
            <button
              onClick={() => squashWithNext(index)}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all duration-200"
              title="Merge with next"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => deleteCaption(caption.id)}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all duration-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={(e) => useCaptionStore.setState({ editText: e.target.value })}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white ${getFontSizeClass()} font-light leading-relaxed tracking-wide resize-none focus:outline-none focus:border-blue-400 transition-colors duration-200`}
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
        <p 
          className={`text-white ${getFontSizeClass()} font-light leading-relaxed tracking-wide cursor-pointer`}
          onClick={() => startEditing(caption)}
        >
          {caption.text}
        </p>
      )}
    </div>
  );
};