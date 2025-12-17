import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Video, AlertCircle } from 'lucide-react';
import SensorCard from './SensorCard';

const MediaSensor: React.FC = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState<'waiting' | 'active' | 'error' | 'inactive'>('waiting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const init = async () => {
      try {
        // 1. Enumerate devices first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter(device => device.kind === 'videoinput');
        const audios = devices.filter(device => device.kind === 'audioinput');
        
        setVideoDevices(videos);
        setAudioDevices(audios);

        // 2. Only request video if we actually have a video input device
        if (videos.length > 0) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setStatus('active');
                setErrorMsg(null);
                
                // Re-enumerate to get labels now that we have permission
                const devicesPost = await navigator.mediaDevices.enumerateDevices();
                setVideoDevices(devicesPost.filter(d => d.kind === 'videoinput'));
                setAudioDevices(devicesPost.filter(d => d.kind === 'audioinput'));
                
            } catch (err: any) {
                console.warn("Camera access failed:", err);
                if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                     setErrorMsg("No camera found");
                     setStatus('active'); 
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                     setErrorMsg("Permission denied");
                     setStatus('inactive');
                } else {
                     setErrorMsg("Camera unavailable");
                     setStatus('active');
                }
            }
        } else {
             // No video devices found in initial enumeration
             setStatus('active');
             setErrorMsg("No camera detected");
        }
      } catch (err) {
        console.error("Error enumerating media devices.", err);
        setStatus('error');
        setErrorMsg("Device enumeration failed");
      }
    };

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <SensorCard 
        title="Camera & Microphone" 
        icon={<Camera size={20} />} 
        status={status === 'error' ? 'error' : status === 'inactive' ? 'waiting' : 'active'}
        className="col-span-1 md:col-span-2"
    >
        <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Live Preview / Placeholder */}
            <div className="w-full md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden border border-ios-gray relative flex items-center justify-center">
                {status === 'active' && !errorMsg && videoDevices.length > 0 ? (
                     <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover opacity-80" 
                        />
                        <div className="absolute bottom-2 left-2 flex gap-1">
                            <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-white font-semibold tracking-wider uppercase">Live</span>
                        </div>
                     </>
                ) : (
                    <div className="flex flex-col items-center text-ios-subtext gap-2">
                        <AlertCircle size={24} className="opacity-50" />
                        <span className="text-xs uppercase tracking-wider">{errorMsg || "No Feed"}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between bg-ios-gray/20 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Video size={18} className="text-ios-blue" />
                        <span className="text-sm">Video Inputs</span>
                    </div>
                    <span className="font-mono text-xl font-bold">{videoDevices.length}</span>
                </div>
                
                 <div className="flex items-center justify-between bg-ios-gray/20 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Mic size={18} className="text-ios-orange" />
                        <span className="text-sm">Audio Inputs</span>
                    </div>
                    <span className="font-mono text-xl font-bold">{audioDevices.length}</span>
                </div>

                <div className="text-xs text-ios-subtext px-1">
                    {videoDevices.length > 0 ? (
                        <p>Detected: {videoDevices[0].label || 'Generic Camera'}</p>
                    ) : (
                        <p>{errorMsg || 'No camera detected.'}</p>
                    )}
                </div>
            </div>
        </div>
    </SensorCard>
  );
};

export default MediaSensor;