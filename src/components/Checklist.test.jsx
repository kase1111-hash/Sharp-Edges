import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Checklist from './Checklist';

describe('Checklist', () => {
  const mockItems = ['Item 1', 'Item 2', 'Item 3'];

  it('renders all checklist items', () => {
    const checkedItems = new Set();
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('shows correct progress count', () => {
    const checkedItems = new Set([0, 2]);
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    expect(screen.getByText('2 / 3 completed')).toBeInTheDocument();
  });

  it('calls onCheckedChange when item is clicked', () => {
    const checkedItems = new Set();
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    fireEvent.click(screen.getByText('Item 1'));

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    const newSet = onCheckedChange.mock.calls[0][0];
    expect(newSet.has(0)).toBe(true);
  });

  it('unchecks item when clicked again', () => {
    const checkedItems = new Set([0]);
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    fireEvent.click(screen.getByText('Item 1'));

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    const newSet = onCheckedChange.mock.calls[0][0];
    expect(newSet.has(0)).toBe(false);
  });

  it('shows 0 progress with empty checklist', () => {
    const checkedItems = new Set();
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    expect(screen.getByText('0 / 3 completed')).toBeInTheDocument();
  });

  it('all items can be checked', () => {
    const checkedItems = new Set([0, 1, 2]);
    const onCheckedChange = vi.fn();

    render(
      <Checklist
        items={mockItems}
        checkedItems={checkedItems}
        onCheckedChange={onCheckedChange}
      />
    );

    expect(screen.getByText('3 / 3 completed')).toBeInTheDocument();
  });
});
