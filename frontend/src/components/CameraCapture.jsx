import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, AlertCircle, FlipHorizontal, Timer } from "lucide-react";
import { quickClientLightingCheck } from "../utils/imageHelpers";
import LightingAlert from "./LightingAlert";

export default function CameraCapture({ onPhotoCaptured, onCancel }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [lightingInfo, setLightingInfo] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start webcam
  const startCamera = async (mode = facingMode) => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Please allow camera access in browser settings or use the file upload option.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera device was detected on your device. Please use the upload photo option.");
      } else {
        setError("Could not initialize camera. Please try file upload instead.");
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  const takePhotoWithCountdown = (seconds = 3) => {
    setCountdown(seconds);
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(null);
        captureFrame();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      // Mirror horizontal for natural selfie feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);

    // Lighting check on canvas frame
    const img = new Image();
    img.onload = () => {
      const check = quickClientLightingCheck(img);
      setLightingInfo(check);
    };
    img.src = dataUrl;
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;

    // Convert dataURL to Blob/File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onPhotoCaptured(file, capturedImage, capturedImage);
      });
  };

  const retake = () => {
    setCapturedImage(null);
    setLightingInfo(null);
    startCamera(facingMode);
  };

  return (
    <div className="w-full glass-panel p-6 rounded-2xl border border-[#E8DFD5] shadow-luxury space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold text-[#121212]">Live Studio Camera</h3>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#7E6553] hover:text-[#121212] p-1 rounded-md hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-xs text-rose-800 max-w-sm mx-auto leading-relaxed">{error}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#121212] rounded-full"
          >
            Switch to File Upload
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Viewfinder Viewport */}
          <div className="relative aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />

                {/* Facial alignment guide overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 border-2 border-dashed border-white/60 rounded-[50%] shadow-glow" />
                  <span className="absolute bottom-4 text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    Position your face within the oval guide
                  </span>
                </div>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-6xl font-bold font-editorial text-white animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Flash effect */}
            {flash && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Controls */}
          {capturedImage ? (
            <div className="space-y-3">
              {lightingInfo && <LightingAlert qualityData={lightingInfo} />}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={retake}
                  className="px-4 py-2.5 rounded-full border border-[#D5C4B4] text-xs font-semibold text-[#121212] hover:bg-stone-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={confirmPhoto}
                  className="px-6 py-2.5 rounded-full bg-[#121212] text-white text-xs font-semibold hover:bg-[#2A2A2A] shadow-luxury flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Use This Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2">
              <button
                type="button"
                onClick={switchCamera}
                title="Flip Camera"
                className="p-2.5 rounded-full bg-stone-100 text-[#7E6553] hover:text-[#121212] hover:bg-stone-200 transition-colors"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => takePhotoWithCountdown(3)}
                  title="3s Timer"
                  className="p-2.5 rounded-full bg-stone-100 text-[#7E6553] hover:text-[#121212] hover:bg-stone-200 transition-colors"
                >
                  <Timer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={captureFrame}
                  className="w-14 h-14 rounded-full border-4 border-[#D4AF37] bg-white hover:bg-stone-100 flex items-center justify-center shadow-luxury transition-transform active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-[#121212]" />
                </button>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#7E6553] hover:text-[#121212] underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
