import { describe, expect, it } from 'vitest';
import { getMonitoringReadiness } from './monitoringReadiness';

describe('getMonitoringReadiness', () => {
  it('blocks camera analysis while the model is loading', () => {
    expect(getMonitoringReadiness({ sourceMode: 'CAMERA', modelReady: false, modelLoading: true, videoSelected: false })).toMatchObject({ canStart: false, label: 'Loading model…' });
  });

  it('blocks all sources when the model is unavailable', () => {
    expect(getMonitoringReadiness({ sourceMode: 'CAMERA', modelReady: false, modelLoading: false, videoSelected: false })).toMatchObject({ canStart: false, label: 'Model unavailable' });
  });

  it('requires a selected file before video analysis', () => {
    expect(getMonitoringReadiness({ sourceMode: 'VIDEO', modelReady: true, modelLoading: false, videoSelected: false })).toMatchObject({ canStart: false, label: 'Choose a video' });
  });

  it('allows camera or video analysis when the model and source are ready', () => {
    expect(getMonitoringReadiness({ sourceMode: 'CAMERA', modelReady: true, modelLoading: false, videoSelected: false }).canStart).toBe(true);
    expect(getMonitoringReadiness({ sourceMode: 'VIDEO', modelReady: true, modelLoading: false, videoSelected: true }).canStart).toBe(true);
  });
});
