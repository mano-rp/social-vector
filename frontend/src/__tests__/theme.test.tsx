import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const ThemeTester: React.FC = () => {
  const { theme, toggleTheme, isHacker } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-hacker">{isHacker ? 'true' : 'false'}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('Theme System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to professional theme', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('pro');
    expect(screen.getByTestId('is-hacker').textContent).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles to hacker theme and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );

    const button = screen.getByText('Toggle Theme');
    fireEvent.click(button);

    expect(screen.getByTestId('current-theme').textContent).toBe('hacker');
    expect(screen.getByTestId('is-hacker').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('socialvector_theme')).toBe('hacker');

    // Toggle back
    fireEvent.click(button);
    expect(screen.getByTestId('current-theme').textContent).toBe('pro');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('socialvector_theme')).toBe('pro');
  });
});
