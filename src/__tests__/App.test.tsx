import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App navigation shell', () => {
  it('renders header and home page by default', () => {
    render(<App />);
    expect(screen.getAllByText('SpeedSight').length).toBeGreaterThan(0);
    expect(screen.getByText('Browser-based vehicle speed monitoring and traffic analytics.')).toBeInTheDocument();
  });
});
