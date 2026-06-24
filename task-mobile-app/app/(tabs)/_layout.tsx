import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar, TABS } from './_components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen 
          key={tab.name} 
          name={tab.name} 
          options={{ title: tab.label }} 
        />
      ))}
    </Tabs>
  );
}
