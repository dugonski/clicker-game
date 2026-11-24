import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => window.localStorage.clear());

test('starts as a Beginner and makes a move on click', () => {
  render(<App />);
  expect(screen.getByText(/next title: club player/i)).toBeInTheDocument();
  expect(screen.getByLabelText('Moves')).toHaveTextContent(/^0$/);

  fireEvent.click(screen.getByRole('button', { name: /click the pawn/i }));
  expect(screen.getByLabelText('Moves')).toHaveTextContent(/^1$/);
});

test('the title match is locked until the goal is reached', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /keep practising/i })).toBeDisabled();
});
