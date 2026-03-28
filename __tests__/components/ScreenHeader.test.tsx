/**
 * ScreenHeader Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScreenHeader } from '@/components/common/ScreenHeader';

describe('ScreenHeader', () => {
  it('renders title', () => {
    const { getByText } = render(<ScreenHeader title="Daily Planner" />);
    expect(getByText('Daily Planner')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <ScreenHeader title="Food" subtitle="42°C — afternoon picks" />
    );
    expect(getByText('Food')).toBeTruthy();
    expect(getByText('42°C — afternoon picks')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(<ScreenHeader title="Home" />);
    expect(queryByText('subtitle')).toBeNull();
  });

  it('renders right action button', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ScreenHeader title="Tips" rightAction={{ label: 'Settings', onPress }} />
    );
    const button = getByText('Settings');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render action when not provided', () => {
    const { queryByText } = render(<ScreenHeader title="Home" />);
    expect(queryByText('Settings')).toBeNull();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <ScreenHeader title="Test" testID="screen-header" />
    );
    expect(getByTestId('screen-header')).toBeTruthy();
  });
});
