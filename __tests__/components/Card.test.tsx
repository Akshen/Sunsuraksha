/**
 * Card Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Hello Sun Se Suraksha</Text>
      </Card>
    );
    expect(getByText('Hello Sun Se Suraksha')).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <Card testID="test-card">
        <Text>Content</Text>
      </Card>
    );
    expect(getByTestId('test-card')).toBeTruthy();
  });

  it('applies default variant styles', () => {
    const { getByTestId } = render(
      <Card testID="default-card">
        <Text>Default</Text>
      </Card>
    );
    const card = getByTestId('default-card');
    expect(card.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: Colors.card }),
      ])
    );
  });

  it('applies tinted variant styles', () => {
    const { getByTestId } = render(
      <Card testID="tinted-card" variant="tinted">
        <Text>Tinted</Text>
      </Card>
    );
    const card = getByTestId('tinted-card');
    // Should have tinted styles in the style array
    const flatStyles = card.props.style.flat().filter(Boolean);
    const hasTinted = flatStyles.some(
      (s: any) => s.backgroundColor === Colors.cardAlt
    );
    expect(hasTinted).toBe(true);
  });

  it('applies noPadding when specified', () => {
    const { getByTestId } = render(
      <Card testID="no-pad" noPadding>
        <Text>No padding</Text>
      </Card>
    );
    const card = getByTestId('no-pad');
    const flatStyles = card.props.style.flat().filter(Boolean);
    const hasNoPadding = flatStyles.some((s: any) => s.padding === 0);
    expect(hasNoPadding).toBe(true);
  });
});
