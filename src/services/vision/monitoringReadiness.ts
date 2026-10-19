export type MonitoringSourceMode = 'CAMERA' | 'VIDEO';

interface MonitoringReadinessInput {
  sourceMode: MonitoringSourceMode;
  modelReady: boolean;
  modelLoading: boolean;
  videoSelected: boolean;
}

export interface MonitoringReadiness {
  canStart: boolean;
  label: string;
  reason: string | null;
}

export function getMonitoringReadiness({ sourceMode, modelReady, modelLoading, videoSelected }: MonitoringReadinessInput): MonitoringReadiness {
  if (modelLoading) return { canStart: false, label: 'Loading model…', reason: 'The vehicle-detection model is still loading. Start analysis when it is ready.' };
  if (!modelReady) return { canStart: false, label: 'Model unavailable', reason: 'The vehicle-detection model could not load. Check your connection and reload the page.' };
  if (sourceMode === 'VIDEO' && !videoSelected) return { canStart: false, label: 'Choose a video', reason: 'Select a local video file before starting analysis.' };
  return { canStart: true, label: 'Start analysis', reason: null };
}
