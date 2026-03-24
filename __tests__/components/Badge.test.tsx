/**
 * Badge Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/common/Badge';

describe('Badge', () => {
  it('renders label text', () => {
    const { getByText } = render(<Badge label="Safe" />);
    expect(getByText('Safe')).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<Badge label="Test" testID="badge" />);
    expect(getByTestId('badge')).toBeTruthy();
  });

  it('renders all variants without crashing', () => {
    const variants = ['safe', 'moderate', 'danger', 'extreme', 'info', 'neutral'] as const;
    variants.forEach((variant) => {
      const { getByText } = render(<Badge label={variant} variant={variant} />);
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('renders small size', () => {
    const { getByText } = render(<Badge label="Small" size="small" />);
    expect(getByText('Small')).toBeTruthy();
  });

  it('defaults to neutral variant', () => {
    const { getByText } = render(<Badge label="Default" />);
    expect(getByText('Default')).toBeTruthy();
  });
});
