'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { DownloadCloud, CheckCircle, Trash2, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if bible is already downloaded
    localforage.getItem('bible_data_web').then((data) => {
      if (data) {
        setDownloadState('completed');
      }
    });
  }, []);

  const handleDownload = async () => {
    try {
      setDownloadState('downloading');
      setProgress(10);
      
      const response = await fetch('/data/bible.json');
      if (!response.ok) throw new Error("Failed to fetch bible dataset");
      
      setProgress(50);
      const data = await response.json();
      
      setProgress(80);
      await localforage.setItem('bible_data_web', data);
      
      setProgress(100);
      setDownloadState('completed');
    } catch (e) {
      console.error(e);
      setDownloadState('error');
    }
  };

  const handleClear = async () => {
    await localforage.removeItem('bible_data_web');
    setDownloadState('idle');
    setProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-serif font-semibold text-stone-800 mb-8">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-medium text-stone-800 flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-stone-500" />
              Offline Mode
            </h2>
            <p className="text-stone-500 mt-2 text-sm max-w-md">
              Download the full World English Bible translation to your device. This enables lightning-fast Global Search and allows you to read without an internet connection.
            </p>
          </div>
          
          {downloadState === 'completed' ? (
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                <CheckCircle className="w-4 h-4" /> Downloaded
              </span>
              <button 
                onClick={handleClear}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 mt-2"
              >
                <Trash2 className="w-3 h-3" /> Remove Data
              </button>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloadState === 'downloading'}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              {downloadState === 'downloading' ? 'Downloading...' : 'Download (4.5MB)'}
            </button>
          )}
        </div>
        
        {downloadState === 'downloading' && (
          <div className="mt-6">
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-800 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-2 text-right">{progress}% Complete</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/" className="text-stone-500 hover:text-stone-800 transition-colors underline decoration-stone-300 underline-offset-4">
          Return to Reading
        </Link>
      </div>
    </div>
  );
}
