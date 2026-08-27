import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

describe('Common UI Components', () => {
  it('renders Avatar with user initials', () => {
    render(<Avatar name="Elena Rostova" username="erostova" size="md" />);
    expect(screen.getByText('ER')).toBeInTheDocument();
  });

  it('renders Badge with correct variant styling', () => {
    render(<Badge variant="success">Verified</Badge>);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders Button with click handler and disabled state', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button onClick={handleClick}>Click Me</Button>
    );

    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<Button onClick={handleClick} disabled>Click Me</Button>);
    expect(button).toBeDisabled();
  });

  it('renders Modal when isOpen is true and closes on Escape', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" description="Test description">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders EmptyState with action trigger', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your filters"
        actionLabel="Reset"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
