import React from 'react';
import { AlertCircle } from 'lucide-react';

export const UnsupportedBrowser: React.FC = () => {
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
};