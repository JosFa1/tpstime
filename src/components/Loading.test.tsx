import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageBoundary } from './Loading';

it('provides an accessible recovery action when a page chunk cannot render', () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  function FailedPage(): never { throw new Error('Loading chunk failed'); }
  try {
    render(<PageBoundary><FailedPage /></PageBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('This page could not be loaded');
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeEnabled();
  } finally { log.mockRestore(); }
});
