import React from 'react';
import { View, ScrollView } from 'react-native';
import { ExploreHeader } from './_components/explore-header';
import { FeatureCard } from './_components/feature-card';
import { GetStartedCard } from './_components/get-started-card';

const EXPLORE_FEATURES = [
  {
    id: '1',
    title: 'Modern Routing',
    description: 'Navigate seamlessly between screens with file-based routing.',
    icon: 'house.fill',
  },
  {
    id: '2',
    title: 'Cross-Platform',
    description: 'One codebase for iOS, Android, and Web with native performance.',
    icon: 'paperplane.fill',
  },
  {
    id: '3',
    title: 'Theme Aware',
    description: 'Full support for light and dark modes out of the box.',
    icon: 'list.bullet',
  },
] as const;

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-background">
      {/* Background tint for the header area to make rounding visible */}
      <View className="absolute top-0 left-0 right-0 h-[400px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER WITH BACKGROUND DECORATION */}
        <ExploreHeader />

        <View className="px-5 py-8 rounded-t-[48px] bg-background -mt-10 flex-1 min-h-[800px]">
          <View className="gap-5">
            {EXPLORE_FEATURES.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                title={feature.title} 
                description={feature.description} 
                icon={feature.icon} 
              />
            ))}
            
            <GetStartedCard />
          </View>
        </View>
        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
