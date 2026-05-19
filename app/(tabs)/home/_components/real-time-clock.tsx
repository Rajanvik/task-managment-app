import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Sunrise, Sun, Sunset, Moon, Clock, Calendar } from 'lucide-react-native';
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
  const yearNum = time.getFullYear();

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
    <View className="pt-4 gap-1.5">
      {/* Row 1: Greeting & Date */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10">
            <IconComponent size={18} color={theme.primary} strokeWidth={2.5} />
          </View>
          <Text className="text-sm font-black text-foreground uppercase tracking-widest">
            {greeting}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 bg-secondary dark:bg-muted border border-border/50 pl-1 pr-3 py-0.5 rounded-lg">
          <View className="w-6 h-6 rounded-md items-center justify-center bg-primary/10">
            <Calendar size={12} color={theme.primary} strokeWidth={2.5} />
          </View>
          <Text className="text-xs font-extrabold text-foreground">
            {dayName}, {monthName} {dateNum}, {yearNum}
          </Text>
        </View>
      </View>

      {/* Row 2: Digital Time */}
      <View className="flex-row items-center justify-between mt-1.5">
        {/* Clock Label (Left aligned) */}
        <View className="flex-row items-center gap-1.5">
          <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10">
            <Clock size={18} color={theme.primary} strokeWidth={2.5} />
          </View>
          <Text className="text-sm font-black text-foreground uppercase tracking-widest">
             Time
          </Text>
        </View>
        
        {/* Unified Time Card (Right aligned) */}
        <View className="flex-row items-center bg-secondary dark:bg-muted border border-border/50 pl-3 pr-1 py-1 rounded-xl">
          <View className="flex-row items-center mr-1.5 gap-1">
            {/* HH */}
            <View className="bg-background dark:bg-background/50 border border-border/50 px-1.5 py-0.5 rounded-md shadow-sm">
              <Text className="text-sm font-black text-foreground font-mono">
                {displayHour}
              </Text>
            </View>
            
            <Text className="text-xs font-black text-muted-foreground/50 font-mono">:</Text>
            
            {/* MM */}
            <View className="bg-background dark:bg-background/50 border border-border/50 px-1.5 py-0.5 rounded-md shadow-sm">
              <Text className="text-sm font-black text-foreground font-mono">
                {minutes}
              </Text>
            </View>
            
            <Text className="text-xs font-black text-muted-foreground/50 font-mono">:</Text>
            
            {/* SS */}
            <View className="bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md shadow-sm">
              <Text className="text-sm font-black text-primary font-mono">
                {seconds}
              </Text>
            </View>
          </View>

          {/* AM/PM */}
          <View className="bg-primary px-2 py-1 rounded-lg">
            <Text className="text-[10px] font-black text-primary-foreground font-mono uppercase tracking-widest">
              {ampm}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
