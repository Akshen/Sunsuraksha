/**
 * Tab Layout
 *
 * 4 tabs: Home, Food, Water, Plan
 * Labels are short enough to never wrap.
 */

import { Tabs } from 'expo-router';
import { Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

function TabEmoji({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabEmoji emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ focused }) => <TabEmoji emoji="🍽️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hydration"
        options={{
          title: 'Water',
          tabBarIcon: ({ focused }) => <TabEmoji emoji="💧" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Plan',
          tabBarIcon: ({ focused }) => <TabEmoji emoji="📋" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.borderLight,
    borderTopWidth: 1,
    height: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: Platform.OS === 'android' ? 6 : 24,
    paddingTop: 6,
    elevation: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
});
