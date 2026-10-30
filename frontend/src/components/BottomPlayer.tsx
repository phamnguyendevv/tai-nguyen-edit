'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useAudio } from '@/lib/audio/player-context';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginModal } from './LoginModal';

interface BottomPlayerProps {
  onOpenLogin?: () => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({ onOpenLogin }) => {
  const { downloadToast } = useAudio();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSignUpClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      {/* Download Notification Toast */}
      {downloadToast && (
        <div
          className={`fixed right-4 sm:right-6 left-4 sm:left-auto z-50 flex items-center justify-center sm:justify-start gap-2.5 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            !isAuthenticated ? 'bottom-16 sm:bottom-20' : 'bottom-6'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{downloadToast}</span>
        </div>
      )}

      {/* Sticky Bottom Call-to-action Banner: ONLY visible when NOT logged in */}
      {!isAuthenticated && (
        <footer className="fixed bottom-0 left-0 right-0 z-30 h-12 sm:h-14 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#1c1c1c] flex items-center justify-between sm:justify-center px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 text-xs font-medium text-neutral-300">
            <span className="hidden sm:inline">Sign up to get access to music, voiceover and sound effects</span>
            <span className="sm:hidden text-neutral-300 truncate text-[11px]">Unlock full audio library</span>
            <button
              type="button"
              onClick={handleSignUpClick}
              className="flex-shrink-0 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-white bg-transparent border border-neutral-600 hover:border-white hover:bg-white/10 active:scale-95 transition-all duration-200"
            >
              Sign Up Now
            </button>
          </div>
        </footer>
      )}

      {/* Auth / Login Modal for fast preset sign in */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

