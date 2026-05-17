import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Sunrise, Sun, Sunset, Moon, Clock } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

export function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  const { colorScheme } = useColorScheme();
  
  // Memoize theme to prevent unnecessary calculations on every second render
  const theme = useMemo(() => THEME[colorScheme], [colorScheme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format digital time details (HH:MM:SS) - Highly optimized
  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = String(hours % 12 || 12).padStart(2, '0');

  // Format calendar details - Static calculations
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = weekdays[time.getDay()];
  const monthName = months[time.getMonth()];
  const dateNum = time.getDate();

  // Dynamic greetings based on hour of day
  const { greeting, IconComponent } = useMemo(() => {
    let greet = "Good Day";
    let Icon = Sun;

    if (hours >= 5 && hours < 12) {
      greet = "Good Morning";
      Icon = Sunrise;
    } else if (hours >= 12 && hours < 17) {
      greet = "Good Afternoon";
      Icon = Sun;
    } else if (hours >= 17 && hours < 21) {
      greet = "Good Evening";
      Icon = Sunset;
    } else {
      greet = "Good Night";
      Icon = Moon;
    }

    return { greeting: greet, IconComponent: Icon };
  }, [hours]);

  return (
    <View className="pt-4 gap-3.5">
      {/* Row 1: Dynamic Greeting (Left) & Today's Date Status (Right) */}
      <View className="flex-row items-center justify-between">
        {/* Dynamic Greeting with Glass Icon Wrapper */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-xl items-center justify-center bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm">
            <IconComponent size={16} color={theme.primary} strokeWidth={2} />
          </View>
          <Text className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            {greeting}
          </Text>
        </View>

        {/* Floating Date Badge */}
        <View className="bg-secondary dark:bg-muted border border-border/50 px-3 py-1 rounded-xl shadow-sm">
          <Text className="text-xs font-extrabold text-foreground">
            {dayName}, {monthName} {dateNum}
          </Text>
        </View>
      </View>

      {/* Row 2: Gorgeous Centered Digital Time Capsule (Symmetric and clean) */}
      <View className="flex-row items-center justify-center gap-2 bg-secondary/50 dark:bg-muted/40 border border-border/50 rounded-2xl py-2 px-4 shadow-sm">
        {/* Consistent Glass Clock Icon Wrapper (Matching Row 1 completely) */}
        <View className="w-8 h-8 rounded-xl items-center justify-center bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm mr-1.5">
          <Clock size={16} color={theme.primary} strokeWidth={2} />
        </View>
        
        {/* HH Card */}
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm shadow-black/5">
          <Text className="text-sm font-black text-foreground font-mono">
            {displayHour}
          </Text>
        </View>

        {/* Separator */}
        <Text className="text-xs font-black text-muted-foreground/60 font-mono">
          :
        </Text>

        {/* MM Card */}
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm shadow-black/5">
          <Text className="text-sm font-black text-foreground font-mono">
            {minutes}
          </Text>
        </View>

        {/* Separator */}
        <Text className="text-xs font-black text-muted-foreground/60 font-mono">
          :
        </Text>

        {/* SS Card */}
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm shadow-black/5">
          <Text className="text-sm font-black text-primary font-mono">
            {seconds}
          </Text>
        </View>

        {/* AM/PM Badge */}
        <View className="bg-primary px-2 py-1 rounded-lg ml-1">
          <Text className="text-[9px] font-black text-primary-foreground font-mono uppercase">
            {ampm}
          </Text>
        </View>
      </View>
    </View>
  );
}
