import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('SpeedSight public landing page', () => {
  it('renders the product overview and honest speed limitation', async () => {
    render(<App />);
    expect(await screen.findByText('Review traffic.')).toBeInTheDocument();
    expect(screen.getByText('See vehicle detections.')).toBeInTheDocument();
    expect(screen.getByText(/Speed is not calibrated/)).toBeInTheDocument();
    expect(screen.queryByText('Try Demo Mode')).not.toBeInTheDocument();
  });
});
