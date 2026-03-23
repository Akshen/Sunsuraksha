/**
 * Tab Layout
 * 
 * Bottom tab navigator with 4 tabs:
 * Home, Food, Hydration, Planner
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type TabIconProps = {
  label: string;
  emoji: string;
  focused: boolean;
};

function TabIcon({ label, emoji, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.primary : Colors.textLight },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" emoji="🌡️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Food" emoji="🥗" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="hydration"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Water" emoji="💧" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Plan" emoji="📋" focused={focused} />
          ),
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
    height: 72,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
});
