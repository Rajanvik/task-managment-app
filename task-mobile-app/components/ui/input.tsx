import { cn } from '@/lib/utils';
import { View, TextInput } from 'react-native';
import { Icon } from '@/components/ui/icon';
import type { LucideIcon } from 'lucide-react-native';

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  icon?: LucideIcon;
  iconSize?: number;
}

function Input({ className, icon: IconComponent, iconSize = 18, ...props }: InputProps & React.RefAttributes<TextInput>) {
  const isInvalid = (props as any)['aria-invalid'];
  
  return (
    <View
      className={cn(
        "relative flex-row items-center w-full bg-card border border-border rounded-xl px-3.5 h-12",
        isInvalid && "border-destructive bg-destructive/5",
        props.editable === false && "opacity-50"
      )}
    >
      {IconComponent && (
        <Icon
          as={IconComponent}
          size={iconSize}
          className="text-muted-foreground mr-3"
        />
      )}
      <TextInput
        className={cn(
          "flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent",
          className
        )}
        placeholderTextColor="#a1a1aa" // text-muted-foreground color
        {...props}
      />
    </View>
  );
}

export { Input };
