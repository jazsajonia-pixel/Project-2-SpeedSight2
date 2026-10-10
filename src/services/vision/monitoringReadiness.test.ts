import { describe, expect, it } from 'vitest';
import { getMonitoringReadiness } from './monitoringReadiness';

describe('getMonitoringReadiness', () => {
  it('blocks camera monitoring while the model is loading', () => {
    expect(getMonitoringReadiness({
      sourceMode: 'CAMERA',
      modelReady: false,
      modelLoading: true,
      videoSelected: false,
    })).toMatchObject({
      canStart: false,
      label: 'Loading Model…',
    });
  });

  it('blocks video monitoring until a file is selected', () => {
    expect(getMonitoringReadiness({
      sourceMode: 'VIDEO',
      modelReady: true,
      modelLoading: false,
      videoSelected: false,
    })).toMatchObject({
      canStart: false,
      label: 'Select Video First',
    });
  });

  it('allows a ready camera or selected video source to start', () => {
    expect(getMonitoringReadiness({
      sourceMode: 'CAMERA',
      modelReady: true,
      modelLoading: false,
      videoSelected: false,
    }).canStart).toBe(true);

    expect(getMonitoringReadiness({
      sourceMode: 'VIDEO',
      modelReady: true,
      modelLoading: false,
      videoSelected: true,
    }).canStart).toBe(true);
  });

  it('keeps demo mode independent from the computer-vision model', () => {
    expect(getMonitoringReadiness({
      sourceMode: 'DEMO',
      modelReady: false,
      modelLoading: true,
      videoSelected: false,
    })).toEqual({ canStart: true, label: 'Start Monitoring', reason: null });
  });
});
