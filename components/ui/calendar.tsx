import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  selected?: Date;
  onSelect?: (date: Date) => void;
  mode?: string;
  className?: string;
}

export function Calendar({ value, onChange, selected, onSelect, mode, className }: CalendarProps) {
  const selectedDate = selected || value || new Date();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  
  // Local state for the displayed month and year
  const [currentDate, setCurrentDate] = React.useState(new Date(selectedDate));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper logic to get all days for a 6x7 grid (42 days)
  const getGridDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Days in previous month
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; key: string }> = [];

    // Fill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(prevMonthYear, prevMonth, daysInPrevMonth - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        key: `prev-${prevDate.getTime()}`
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        date: currDate,
        isCurrentMonth: true,
        key: `curr-${currDate.getTime()}`
      });
    }

    // Fill next month days to make a complete 6-week grid (42 items)
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    let nextMonthDay = 1;
    while (days.length < 42) {
      const nextDate = new Date(nextMonthYear, nextMonth, nextMonthDay++);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        key: `next-${nextDate.getTime()}`
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
    if (onSelect) {
      onSelect(date);
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const gridDays = getGridDays();

  return (
    <View className={cn("p-4 bg-popover rounded-xl border border-border shadow-xl", className)}>
      {/* Month Navigation Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-bold text-foreground">
          {monthNames[month]} {year}
        </Text>
        <View className="flex-row gap-1">
          <Pressable
            onPress={handlePrevMonth}
            className="p-1.5 rounded-md border border-border bg-background active:bg-secondary flex items-center justify-center"
          >
            <ChevronLeft size={16} color={theme.foreground} />
          </Pressable>
          <Pressable
            onPress={handleNextMonth}
            className="p-1.5 rounded-md border border-border bg-background active:bg-secondary flex items-center justify-center"
          >
            <ChevronRight size={16} color={theme.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Titles */}
      <View className="flex-row justify-between mb-2">
        {weekdays.map((day) => (
          <View key={day} className="w-9 h-9 items-center justify-center">
            <Text className="text-[11px] font-medium text-muted-foreground">{day}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-1">
        {gridDays.map(({ date, isCurrentMonth, key }) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <Pressable
              key={key}
              onPress={() => handleSelectDay(date)}
              className={cn(
                "w-9 h-9 items-center justify-center rounded-md",
                isSelected && "bg-primary active:bg-primary/90",
                !isSelected && isCurrentMonth && "active:bg-secondary",
                !isSelected && !isCurrentMonth && "opacity-30 active:bg-secondary"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-primary-foreground font-bold" : "text-foreground",
                  !isSelected && !isCurrentMonth && "text-muted-foreground font-normal"
                )}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
