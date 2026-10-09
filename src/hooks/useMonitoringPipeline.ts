import { useState, useRef, useEffect, useCallback } from 'react';
import { vehicleDetector } from '../services/vision/detector';
import { TrackedVehicle } from '../services/vision/tracker';
import { InferenceGate } from '../services/vision/inferenceGate';
import { api } from '../services/api';

export interface UseMonitoringPipelineOptions {
  sessionId?: string;
  fpsTarget?: number;
}

export function useMonitoringPipeline(options: UseMonitoringPipelineOptions = {}) {
  const { sessionId, fpsTarget = 10 } = options;

  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(0);
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicle[]>([]);
  const [activeSourceType, setActiveSourceType] = useState<'camera' | 'video' | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const reportedTracksRef = useRef<Set<string>>(new Set());
  const inferenceGateRef = useRef(new InferenceGate());

  // Refs to avoid stale closures in loop
  const isMonitoringRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Load available camera input devices
  useEffect(() => {
    async function getDevices() {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputDevices = devices.filter((d) => d.kind === 'videoinput');
          setAvailableDevices(videoInputDevices);
          if (videoInputDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputDevices[0].deviceId);
          }
        } catch {
          // ignore device listing errors
        }
      }
    }
    getDevices();
  }, [selectedDeviceId]);

  // Preload TF.js detection model
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        await vehicleDetector.initialize();
        if (isMounted) {
          setIsModelLoaded(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to initialize computer vision model.');
        }
      }
    };
    loadModel();
    return () => {
      isMounted = false;
    };
  }, []);

  const processFrame = useCallback(async () => {
    if (!isMonitoringRef.current) return;

    if (isPausedRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const interval = 1000 / fpsTarget;

    if (now - lastFrameTimeRef.current >= interval) {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        if (!inferenceGateRef.current.tryEnter()) return;

        try {
          const tracks = await vehicleDetector.detectAndTrack(videoRef.current);
          if (!isMonitoringRef.current) return;

          setTrackedVehicles(tracks);

          const elapsedSeconds = (now - lastFrameTimeRef.current) / 1000;
          setFps(Math.round(1 / elapsedSeconds));
          lastFrameTimeRef.current = now;

          // If a session exists, persist newly identified tracked vehicles without fake speeds
          if (sessionId) {
            for (const track of tracks) {
              if (!reportedTracksRef.current.has(track.trackingId)) {
                reportedTracksRef.current.add(track.trackingId);

                api.createDetection({
                  sessionId,
                  trackingId: track.trackingId,
                  vehicleType: track.vehicleType.toUpperCase(),
                  estimatedSpeed: 0, // Explicitly 0 / pending speed estimation per Phase 5 scope
                  speedUnit: 'KMH',
                  classification: 'NORMAL',
                  confidence: track.confidence,
                  boundingBox: track.boundingBox,
                }).catch(() => {
                  // Non-fatal API reporting failure
                });
              }
            }
          }
        } catch (err: any) {
          // Frame processing error caught non-fatally
        } finally {
          inferenceGateRef.current.leave();
        }
      }
    }

    if (isMonitoringRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [fpsTarget, sessionId]);

  const startCameraStream = async (deviceId?: string) => {
    setIsInitializing(true);
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const targetDeviceId = deviceId || selectedDeviceId;

      const constraints: MediaStreamConstraints = {
        video: targetDeviceId
          ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setActiveSourceType('camera');
      setIsMonitoring(true);
      setIsPaused(false);
      vehicleDetector.resetTracker();
      reportedTracksRef.current.clear();
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err: any) {
      setError(err?.message || 'Unable to access camera feed.');
      setIsMonitoring(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadVideoFile = async (file: File) => {
    setIsInitializing(true);
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const videoUrl = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoUrl;
        videoRef.current.loop = true;
        await videoRef.current.play();
      }

      setActiveSourceType('video');
      setIsMonitoring(true);
      setIsPaused(false);
      vehicleDetector.resetTracker();
      reportedTracksRef.current.clear();
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err: any) {
      setError(err?.message || 'Failed to load video file.');
      setIsMonitoring(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const pauseMonitoring = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPaused(true);
  };

  const resumeMonitoring = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
    setIsPaused(false);
  };

  const stopMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }

    setIsMonitoring(false);
    setIsPaused(false);
    setActiveSourceType(null);
    setTrackedVehicles([]);
    setFps(0);
    vehicleDetector.resetTracker();
    reportedTracksRef.current.clear();
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    videoRef,
    isInitializing,
    isModelLoaded,
    modelReady: isModelLoaded,
    isMonitoring,
    isPaused,
    fps,
    trackedVehicles,
    vehicleCount: trackedVehicles.length,
    activeSourceType,
    sourceMode: activeSourceType,
    availableDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    error,
    startCameraStream,
    startMonitoring: startCameraStream,
    loadVideoFile,
    pauseMonitoring,
    resumeMonitoring,
    stopMonitoring,
  };
}
