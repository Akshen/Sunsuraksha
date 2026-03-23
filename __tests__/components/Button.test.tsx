/**
 * Button Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';

describe('Button', () => {
  it('renders title text', () => {
    const { getByText } = render(
      <Button title="Press me" onPress={() => {}} />
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Tap" onPress={onPress} />
    );
    fireEvent.press(getByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Disabled" onPress={onPress} disabled testID="btn" />
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, getByTestId } = render(
      <Button title="Submit" onPress={() => {}} loading testID="loading-btn" />
    );
    // Title should NOT be visible when loading
    expect(queryByText('Submit')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Wait" onPress={onPress} loading testID="btn" />
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders all variants without crashing', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
    variants.forEach((variant) => {
      const { getByText } = render(
        <Button title={variant} onPress={() => {}} variant={variant} />
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('renders small size', () => {
    const { getByText } = render(
      <Button title="Small" onPress={() => {}} size="small" />
    );
    expect(getByText('Small')).toBeTruthy();
  });
});
