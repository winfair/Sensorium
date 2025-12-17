import React, { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import JSZip from 'jszip';

// Helper to provide file content. In a real build step this wouldn't be manual.
const getProjectFiles = () => ({
  'index.html': document.documentElement.outerHTML, // Poor man's way to get index, but sufficient for structure
  'README.md': `# Sensorium\n\nA sensor dashboard for iOS devices.`,
  'types.ts': `export interface Vector3 { x: number|null; y: number|null; z: number|null; }
export interface Euler { alpha: number|null; beta: number|null; gamma: number|null; }
export interface GeolocationData { latitude: number|null; longitude: number|null; altitude: number|null; accuracy: number|null; altitudeAccuracy: number|null; heading: number|null; speed: number|null; }
declare global { interface DeviceOrientationEvent { webkitCompassHeading?: number; } }`,
  // We can't easily get the TSX source at runtime in this environment without fetch. 
  // For the purpose of the "Download Structure" button in this demo, 
  // we will create a placeholder structure that users can populate.
  'INSTRUCTIONS.txt': `This is a generated zip from the live preview.\n\nTo get the full source code, please copy the files from the editor interface.`
});

const DownloadButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      
      // Since we cannot read the source files from the browser runtime directly in this environment,
      // we will generate a template structure.
      zip.file("README.md", "# Sensorium Project\n\nRun `npm install` and `npm start`.");
      zip.file("index.html", "<!DOCTYPE html><html><body><div id='root'></div></body></html>");
      
      const src = zip.folder("src");
      src?.file("App.tsx", "// App entry point");
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sensorium-app.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setComplete(true);
      setTimeout(() => setComplete(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 bg-ios-gray/50 hover:bg-ios-gray/80 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
      disabled={loading}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : complete ? <Check size={14} className="text-ios-green" /> : <Download size={14} />}
      {complete ? 'Downloaded' : 'Download Code'}
    </button>
  );
};

export default DownloadButton;