'use client';

import React, { useState } from 'react';
import { PhotoCapture } from '@photoidentifier/ui';
import { useRouter } from 'next/navigation';

export default function WingWatchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'photo' | 'audio'>('photo');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePhotoCapture = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'bird');

      const response = await fetch('/api/identify/bird', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify bird');
      }

      const result = await response.json();
      sessionStorage.setItem('wingwatch_result', JSON.stringify({
        ...result,
        method: 'photo'
      }));

      router.push('/wingwatch/result');
    } catch (error) {
      console.error('Identification error:', error);
      alert('Failed to identify bird. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);

      // Store recorder to stop manually
      (window as any).currentRecorder = mediaRecorder;
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if ((window as any).currentRecorder) {
      (window as any).currentRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyzeAudio = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'bird-call.webm');
      formData.append('type', 'bird_audio');

      const response = await fetch('/api/identify/bird-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify bird from audio');
      }

      const result = await response.json();
      sessionStorage.setItem('wingwatch_result', JSON.stringify({
        ...result,
        method: 'audio',
        audioUrl
      }));

      router.push('/wingwatch/result');
    } catch (error) {
      console.error('Audio analysis error:', error);
      alert('Failed to identify bird from audio. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleResetAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-sky-100 dark:bg-sky-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Analyzing Bird {activeTab === 'photo' ? 'Photo' : 'Call'}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Identifying species...
                </p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-sky-600 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-sky-100 dark:bg-sky-900 rounded-full">
            <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
            WingWatch
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify birds by photo or sound
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex bg-white dark:bg-neutral-800 rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'photo'
                  ? 'bg-sky-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Photo
              </span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'audio'
                  ? 'bg-sky-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Audio
              </span>
            </button>
          </div>
        </div>

        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="max-w-md mx-auto">
            <PhotoCapture
              onCapture={handlePhotoCapture}
              aspectRatio="4:3"
              defaultMode="camera"
            />
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              {!audioUrl ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${isRecording ? 'bg-error-100 animate-pulse' : 'bg-sky-100 dark:bg-sky-900'} mb-4`}>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-error-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        }`}
                      >
                        {isRecording ? (
                          <div className="w-8 h-8 bg-white rounded" />
                        ) : (
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-lg font-semibold mb-2">
                      {isRecording ? 'Recording...' : 'Record Bird Call'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {isRecording
                        ? 'Tap to stop recording (max 10s)'
                        : 'Tap to start recording'}
                    </p>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-950 rounded-lg p-4">
                    <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">Tips for best results:</h4>
                    <ul className="text-sm text-sky-800 dark:text-sky-200 space-y-1 text-left">
                      <li>• Get as close as possible to the bird</li>
                      <li>• Wait for clear, uninterrupted calls</li>
                      <li>• Minimize background noise</li>
                      <li>• Record for 3-10 seconds</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-success-100 dark:bg-success-900 rounded-full">
                      <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Recording Complete</h3>

                    <audio
                      controls
                      src={audioUrl}
                      className="w-full mb-4"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={handleResetAudio}
                        className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
                      >
                        Record Again
                      </button>
                      <button
                        onClick={handleAnalyzeAudio}
                        className="flex-1 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Identify Bird
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="font-semibold">Photo ID</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify birds from photos
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-semibold">Audio ID</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify by bird calls & songs
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-semibold">Life List</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track your sightings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
