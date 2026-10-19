import { useState, useRef, useEffect, useCallback } from 'react';
import { vehicleDetector } from '../services/vision/detector';
import { TrackedVehicle } from '../services/vision/tracker';
import { InferenceGate } from '../services/vision/inferenceGate';
import { api } from '../services/api';

export interface UseMonitoringPipelineOptions {
  sessionId?: string;
  fpsTarget?: number;
  minConfidence?: number;
}

export function useMonitoringPipeline(options: UseMonitoringPipelineOptions = {}) {
  const { sessionId, fpsTarget = 10, minConfidence = 0.3 } = options;
  const [isInitializing, setIsInitializing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(0);
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicle[]>([]);
  const [activeSourceType, setActiveSourceType] = useState<'camera' | 'video' | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const reportedTracksRef = useRef<Set<string>>(new Set());
  const inferenceGateRef = useRef(new InferenceGate());
  const isMonitoringRef = useRef(false);
  const isPausedRef = useRef(false);
  const minConfidenceRef = useRef(minConfidence);
  const sessionIdRef = useRef(sessionId);

  useEffect(() => { isMonitoringRef.current = isMonitoring; }, [isMonitoring]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { minConfidenceRef.current = minConfidence; }, [minConfidence]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  const setSessionId = (id?: string) => { sessionIdRef.current = id; };

  useEffect(() => {
    async function getDevices() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput');
        setAvailableDevices(devices);
        setSelectedDeviceId((current) => current || devices[0]?.deviceId || '');
      } catch {
        // Device enumeration can be unavailable until permission is granted.
      }
    }
    void getDevices();
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsModelLoading(true);
    vehicleDetector.initialize()
      .then(() => { if (isMounted) setIsModelLoaded(true); })
      .catch((err: Error) => { if (isMounted) setError(err.message || 'Could not load the vehicle-detection model.'); })
      .finally(() => { if (isMounted) setIsModelLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const processFrame = useCallback(async () => {
    if (!isMonitoringRef.current) return;
    if (isPausedRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const interval = 1000 / fpsTarget;
    if (now - lastFrameTimeRef.current >= interval && videoRef.current?.readyState && videoRef.current.readyState >= 2) {
      if (!inferenceGateRef.current.tryEnter()) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      try {
        const tracks = await vehicleDetector.detectAndTrack(videoRef.current, minConfidenceRef.current);
        if (!isMonitoringRef.current) return;
        setTrackedVehicles(tracks);
        const elapsedSeconds = Math.max((now - lastFrameTimeRef.current) / 1000, 0.001);
        setFps(Math.min(fpsTarget, Math.round(1 / elapsedSeconds)));
        lastFrameTimeRef.current = now;

        if (sessionIdRef.current) {
          for (const track of tracks) {
            if (reportedTracksRef.current.has(track.trackingId)) continue;
            reportedTracksRef.current.add(track.trackingId);
            api.createDetection({
              sessionId: sessionIdRef.current,
              trackingId: track.trackingId,
              vehicleType: track.vehicleType.toUpperCase(),
              estimatedSpeed: 0,
              speedUnit: 'KMH',
              classification: 'NORMAL',
              confidence: track.confidence,
              boundingBox: track.boundingBox,
            }).catch(() => { /* Saving metadata is non-fatal to local video analysis. */ });
          }
        }
      } catch {
        // Individual frame errors should not stop later frames from being analyzed.
      } finally {
        inferenceGateRef.current.leave();
      }
    }
    if (isMonitoringRef.current) animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [fpsTarget]);

  const startCameraStream = async (deviceId?: string, requestedSessionId?: string) => {
    if (requestedSessionId) sessionIdRef.current = requestedSessionId;
    if (!isModelLoaded) {
      setError(isModelLoading ? 'The vehicle-detection model is still loading. Wait until it is ready.' : 'The vehicle-detection model is unavailable. Reload the page and try again.');
      return false;
    }
    setIsInitializing(true);
    setError(null);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
      const targetDeviceId = deviceId || selectedDeviceId;
      const constraints: MediaStreamConstraints = {
        video: targetDeviceId ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.src = '';
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
      return true;
    } catch (err: any) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(err?.message || 'Unable to access the camera. Check browser permissions and try again.');
      setIsMonitoring(false);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  const loadVideoFile = async (file: File, requestedSessionId?: string) => {
    if (requestedSessionId) sessionIdRef.current = requestedSessionId;
    if (!isModelLoaded) {
      setError(isModelLoading ? 'The vehicle-detection model is still loading. Wait until it is ready.' : 'The vehicle-detection model is unavailable. Reload the page and try again.');
      return false;
    }
    setIsInitializing(true);
    setError(null);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      const videoUrl = URL.createObjectURL(file);
      videoUrlRef.current = videoUrl;
      if (!videoRef.current) throw new Error('The video player is not ready. Reload the page and try again.');
      videoRef.current.srcObject = null;
      videoRef.current.src = videoUrl;
      videoRef.current.loop = true;
      await videoRef.current.play();
      setActiveSourceType('video');
      setIsMonitoring(true);
      setIsPaused(false);
      vehicleDetector.resetTracker();
      reportedTracksRef.current.clear();
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Could not play this video. Try a supported MP4, WebM or Ogg file.');
      setIsMonitoring(false);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  const pauseMonitoring = () => {
    videoRef.current?.pause();
    setIsPaused(true);
  };
  const resumeMonitoring = () => {
    void videoRef.current?.play().catch(() => setError('Video playback could not resume. Press play again or reload the source.'));
    setIsPaused(false);
  };

  const stopMonitoring = () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
    isMonitoringRef.current = false;
    setIsMonitoring(false);
    setIsPaused(false);
    setActiveSourceType(null);
    setTrackedVehicles([]);
    setFps(0);
    vehicleDetector.resetTracker();
    reportedTracksRef.current.clear();
  };

  useEffect(() => () => stopMonitoring(), []);

  return {
    videoRef, isInitializing, isModelLoading, isModelLoaded, modelReady: isModelLoaded,
    isMonitoring, isPaused, fps, trackedVehicles, vehicleCount: trackedVehicles.length,
    activeSourceType, sourceMode: activeSourceType, availableDevices, selectedDeviceId,
    setSelectedDeviceId, setSessionId, error, startCameraStream, startMonitoring: startCameraStream,
    loadVideoFile, pauseMonitoring, resumeMonitoring, stopMonitoring,
  };
}
