import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('SpeedSight Phase 2 Navigation Shell', () => {
  it('renders landing page on root path', () => {
    render(<App />);
    expect(screen.getByText('Measure Traffic.')).toBeInTheDocument();
    expect(screen.getByText('Understand Speed.')).toBeInTheDocument();
  });
});
