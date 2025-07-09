import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Example: Test that the Dashboard renders
test('renders Dashboard title', async () => {
  render(<App />);
  // Look for the Dashboard heading
  const dashboardTitle = await screen.findByText(/dashboard/i);
  expect(dashboardTitle).toBeInTheDocument();
});

// Example: Test that the Settings screen can be navigated to (if navigation is simple)
test('renders Settings in navigation', async () => {
  render(<App />);
  // Look for the Settings button in the bottom nav
  const settingsButton = await screen.findByText(/settings/i);
  expect(settingsButton).toBeInTheDocument();
});

test('app loads without crashing', () => {
  render(<App />);
  // You can check for any element that should always be present, e.g. the main container or a heading
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
