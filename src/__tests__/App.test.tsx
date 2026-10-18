import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('SpeedSight Phase 2 Navigation Shell', () => {
  it('renders landing page on root path after its route chunk loads', async () => {
    render(<App />);
    expect(await screen.findByText('Measure Traffic.')).toBeInTheDocument();
    expect(await screen.findByText('Understand Speed.')).toBeInTheDocument();
  });
});
