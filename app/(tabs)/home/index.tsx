import React from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { DashboardDataHook } from "@/hooks/data-hooks/use-dashboard";
import { AnimatedReveal } from "@/components/ui/animated-reveal";

import { HomeHeader } from "./_components/home-header";
import { ProgressCard } from "./_components/progress-card";
import { StatsGrid } from "./_components/stats-grid";
import { RecentTasksList } from "./_components/recent-tasks";
import { ReminderCard } from "./_components/reminder-card";
import { FaqAccordion } from "./_components/faq-accordion";
import { FooterCredit } from "./_components/footer-credit";

interface IHomeScreenProps {}

const HomeScreen: React.FC<IHomeScreenProps> = () => {
  // Dashboard analytics API se seedha stats lo — client-side calculations ki zarurat nahi
  const { data: analytics } = DashboardDataHook.useDashboardAnalytics();

  const completedTasks = analytics?.summary.completedTasks ?? 0;
  const pendingTasks = analytics?.summary.pendingTasks ?? 0;
  const totalTasks = analytics?.summary.totalTasks ?? 0;
  const progressPercentage = analytics?.summary.taskCompletionRate ?? 0;

  return (
    <Animated.View entering={FadeIn.duration(700)} className="flex-1 bg-background">
      {/* Background tint for the header area to make rounding visible */}
      <View className="absolute top-0 left-0 right-0 h-[400px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER WITH BACKGROUND DECORATION */}
        <AnimatedReveal variant="slide-down" delay={50} duration={400}>
          <HomeHeader />
        </AnimatedReveal>

        <View className="px-5 py-5 rounded-t-[48px] bg-background -mt-10 flex-1 min-h-[800px]">
          {/* MAIN PROGRESS CARD */}
          <AnimatedReveal variant="slide-up" delay={150} duration={500}>
            <ProgressCard
              completedTasks={completedTasks}
              progressPercentage={progressPercentage}
            />
          </AnimatedReveal>

          {/* STATS GRID */}
          <AnimatedReveal variant="slide-up" delay={250} duration={500}>
            <StatsGrid
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
              totalTasks={totalTasks}
            />
          </AnimatedReveal>

          {/* TODAY'S RECENT TASKS MAPPED LIST */}
          <AnimatedReveal variant="slide-up" delay={350} duration={550}>
            <RecentTasksList />
          </AnimatedReveal>

          {/* PENDING TASKS REMINDER WIDGET */}
          <AnimatedReveal variant="slide-up" delay={450} duration={550}>
            <ReminderCard />
          </AnimatedReveal>

          {/* ACCORDION SECTION */}
          <AnimatedReveal variant="slide-up" delay={550} duration={600}>
            <FaqAccordion />
          </AnimatedReveal>

          {/* FOOTER CREDITS */}
          <AnimatedReveal variant="fade" delay={650} duration={500}>
            <FooterCredit />
          </AnimatedReveal>
        </View>
        <View className="h-20" />
      </ScrollView>
    </Animated.View>
  );
};

export default HomeScreen;
