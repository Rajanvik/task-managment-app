import { type Task } from "@/app/(tabs)/tasks/data/task-data";
import { useTasks } from "@/context/TaskContext";
import React from "react";
import { ScrollView, View } from "react-native";
import { HomeHeader } from "./_components/home-header";
import { ProgressCard } from "./_components/progress-card";
import { StatsGrid } from "./_components/stats-grid";
import { ReminderCard } from "./_components/reminder-card";
import { FaqAccordion } from "./_components/faq-accordion";
import { FooterCredit } from "./_components/footer-credit";

export default function HomeScreen() {
  const { tasks } = useTasks();
  const { totalTasks, pendingTasks, completedTasks, progressPercentage } = React.useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t: Task) => t.status === "Pending").length;
    const completed = tasks.filter((t: Task) => t.status === "Completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      pendingTasks: pending,
      completedTasks: completed,
      progressPercentage: progress,
    };
  }, [tasks]);

  return (
    <View className="flex-1 bg-background">
      {/* Background tint for the header area to make rounding visible */}
      <View className="absolute top-0 left-0 right-0 h-[400px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER WITH BACKGROUND DECORATION */}
        <HomeHeader />

        <View className="px-5 py-5 rounded-t-[48px] bg-background -mt-10 flex-1 min-h-[800px]">
          {/* MAIN PROGRESS CARD */}
          <ProgressCard 
            completedTasks={completedTasks} 
            progressPercentage={progressPercentage} 
          />

          {/* STATS GRID */}
          <StatsGrid 
            completedTasks={completedTasks} 
            pendingTasks={pendingTasks} 
            totalTasks={totalTasks} 
          />

          {/* PENDING TASKS REMINDER WIDGET */}
          <ReminderCard />

          {/* ACCORDION SECTION */}
          <FaqAccordion />

          {/* FOOTER CREDITS */}
          <FooterCredit />
        </View>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
