import React, { useState } from 'react';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA, suppress the install button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Install as home screen application"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#FAF8F5] border border-amber-950/15 p-6 shadow-xl text-stone-900">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-base font-semibold font-editorial">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-semibold text-xs shrink-0">
                    1
                  </div>
                  <p className="pt-0.5">
                    Tap the <Share2 className="w-4 h-4 inline text-amber-800 mx-1" /> <strong>Share</strong> button in Safari’s bottom toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-semibold text-xs shrink-0">
                    2
                  </div>
                  <p className="pt-0.5">
                    Scroll down and tap <PlusSquare className="w-4 h-4 inline text-amber-800 mx-1" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-semibold text-xs shrink-0">
                    3
                  </div>
                  <p className="pt-0.5">
                    Tap <strong>Add</strong> in the top-right corner to launch with zero browser chrome.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-900 text-amber-50 font-medium text-xs hover:bg-amber-950 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
