import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';

describe('Unit Tests: Reusable Component Library', () => {
  describe('<StatusBadge />', () => {
    it('renders ACTIVE status with sky blue theme', () => {
      render(<StatusBadge status="ACTIVE" />);
      const badge = screen.getByText('ACTIVE');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('text-sky-700');
    });

    it('renders PENDING status with amber theme', () => {
      render(<StatusBadge status="PENDING" />);
      const badge = screen.getByText('PENDING');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('text-amber-700');
    });

    it('renders INACTIVE or REJECTED status with red theme', () => {
      render(<StatusBadge status="INACTIVE" />);
      const badge = screen.getByText('INACTIVE');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('text-rose-700');
    });
  });

  describe('<SearchToolbar />', () => {
    it('triggers onSearchChange when user types in search input', () => {
      const onSearchChange = vi.fn();
      render(
        <SearchToolbar
          search=""
          onSearchChange={onSearchChange}
          placeholder="Search dealers..."
        />
      );

      const input = screen.getByPlaceholderText('Search dealers...');
      fireEvent.change(input, { target: { value: 'Metro' } });
      expect(onSearchChange).toHaveBeenCalledWith('Metro');
    });

    it('triggers onRefresh callback when refresh button is clicked', () => {
      const onRefresh = vi.fn();
      render(
        <SearchToolbar
          search=""
          onSearchChange={vi.fn()}
          onRefresh={onRefresh}
        />
      );

      const refreshBtn = screen.getByTitle('Refresh table data');
      fireEvent.click(refreshBtn);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('<DataTable />', () => {
    interface TestData {
      id: number;
      name: string;
      code: string;
    }

    const testColumns = [
      { key: 'id' as const, header: 'ID' },
      { key: 'name' as const, header: 'Name' },
      { key: 'code' as const, header: 'Code' },
    ];

    const testData: TestData[] = [
      { id: 1, name: 'North Hub', code: 'NH-01' },
      { id: 2, name: 'South Hub', code: 'SH-02' },
    ];

    it('renders table headers and rows accurately', () => {
      render(
        <DataTable
          columns={testColumns}
          data={testData}
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('North Hub')).toBeInTheDocument();
      expect(screen.getByText('South Hub')).toBeInTheDocument();
    });

    it('renders empty state when data array is empty', () => {
      render(
        <DataTable<TestData>
          columns={testColumns}
          data={[]}
          emptyMessage="No telecom records found."
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByText('No telecom records found.')).toBeInTheDocument();
    });

    it('renders loading skeleton when isLoading is true', () => {
      const { container } = render(
        <DataTable<TestData>
          columns={testColumns}
          data={[]}
          isLoading={true}
          keyExtractor={(item) => item.id}
        />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('<ConfirmationDialog />', () => {
    it('renders title and description when open', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Deactivate Account"
          description="Are you sure you want to deactivate?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByText('Deactivate Account')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to deactivate?')).toBeInTheDocument();
    });

    it('triggers onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Proceed"
          description="Confirm action"
          confirmLabel="Yes, Proceed"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Yes, Proceed'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('triggers onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Proceed"
          description="Confirm action"
          cancelLabel="Dismiss"
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />
      );

      fireEvent.click(screen.getByText('Dismiss'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
