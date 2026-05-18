import React from 'react';
import { View, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { Text } from '@/components/ui/text';
import { ProfileHeader } from './_components/profile-header';
import { PreferencesCard } from './_components/preferences-card';
import { AccountCard } from './_components/account-card';
import { AnimatedReveal } from '@/components/ui/animated-reveal';

export default function ProfileScreen() {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View className="flex-1 bg-background">
      {/* Background tint for the header area to make rounding visible */}
      <View className="absolute top-0 left-0 right-0 h-[400px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER WITH PROFILE INFO */}
        <AnimatedReveal variant="slide-down" delay={50} duration={400}>
          <ProfileHeader />
        </AnimatedReveal>

        <View className="px-5 py-8 rounded-t-[48px] bg-background -mt-10 flex-1 min-h-[800px]">
          <View className="gap-4">
            {/* Preferences Section */}
            <AnimatedReveal variant="slide-up" delay={150} duration={500}>
              <PreferencesCard />
            </AnimatedReveal>

            {/* Account Section */}
            <AnimatedReveal variant="slide-up" delay={300} duration={500}>
              <AccountCard />
            </AnimatedReveal>
          </View>

          <AnimatedReveal variant="fade" delay={450} duration={400}>
            <Text className="text-center py-10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              Version {appVersion} Stable
            </Text>
          </AnimatedReveal>
        </View>
      </ScrollView>
    </View>
  );
}
