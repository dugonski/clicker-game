import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => window.localStorage.clear());

test('starts on Earth and collects stardust on click', () => {
  render(<App />);
  expect(screen.getByText(/next destination: the moon/i)).toBeInTheDocument();
  expect(screen.getByLabelText('Stardust')).toHaveTextContent(/^\s*0$/);

  fireEvent.click(screen.getByRole('button', { name: /click earth/i }));
  expect(screen.getByLabelText('Stardust')).toHaveTextContent(/^\s*1$/);
});

test('the launch button is disabled until the goal is reached', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /preparing launch/i })).toBeDisabled();
});
