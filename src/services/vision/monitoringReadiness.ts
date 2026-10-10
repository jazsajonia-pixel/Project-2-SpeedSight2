export type MonitoringSourceMode = 'CAMERA' | 'VIDEO' | 'DEMO';

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

export function getMonitoringReadiness({
  sourceMode,
  modelReady,
  modelLoading,
  videoSelected,
}: MonitoringReadinessInput): MonitoringReadiness {
  if (sourceMode === 'DEMO') {
    return { canStart: true, label: 'Start Monitoring', reason: null };
  }

  if (modelLoading) {
    return {
      canStart: false,
      label: 'Loading Model…',
      reason: 'The vehicle-detection model is still loading. Start monitoring when it is ready.',
    };
  }

  if (!modelReady) {
    return {
      canStart: false,
      label: 'Model Unavailable',
      reason: 'The vehicle-detection model is unavailable. Reload the page and try again.',
    };
  }

  if (sourceMode === 'VIDEO' && !videoSelected) {
    return {
      canStart: false,
      label: 'Select Video First',
      reason: 'Choose a local video file before starting video detection.',
    };
  }

  return { canStart: true, label: 'Start Monitoring', reason: null };
}
