import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeOutUp, SlideInUp, Layout } from 'react-native-reanimated';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setListener, ToastMessage } from '@/lib/toast';

export function Toaster({ richColors, closeButton }: any) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setListener((toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 3)); 
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    });
    return () => setListener(null);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View 
      className="absolute left-0 right-0 z-50 items-center pointer-events-box-none" 
      style={{ top: insets.top + 10 }}
    >
      {toasts.map((toast, index) => {
        let bgClass = "bg-background border-border";
        let textClass = "text-foreground";
        let descClass = "text-muted-foreground";
        let icon = null;

        if (richColors) {
          if (toast.type === 'success') { bgClass = "bg-green-500 border-green-600"; textClass = "text-white"; descClass = "text-green-100"; icon = <CheckCircle2 size={20} color="white" />; }
          else if (toast.type === 'error') { bgClass = "bg-destructive border-red-600"; textClass = "text-white"; descClass = "text-red-100"; icon = <XCircle size={20} color="white" />; }
          else if (toast.type === 'warning') { bgClass = "bg-amber-500 border-amber-600"; textClass = "text-white"; descClass = "text-amber-100"; icon = <AlertTriangle size={20} color="white" />; }
          else if (toast.type === 'info') { bgClass = "bg-blue-500 border-blue-600"; textClass = "text-white"; descClass = "text-blue-100"; icon = <Info size={20} color="white" />; }
        } else {
          if (toast.type === 'success') icon = <CheckCircle2 size={20} color="#22c55e" />;
          else if (toast.type === 'error') icon = <XCircle size={20} color="#ef4444" />;
          else if (toast.type === 'warning') icon = <AlertTriangle size={20} color="#f59e0b" />;
          else if (toast.type === 'info') icon = <Info size={20} color="#3b82f6" />;
        }

        return (
          <Animated.View
            key={toast.id}
            layout={Layout.springify()}
            entering={SlideInUp.duration(300)}
            exiting={FadeOutUp.duration(200)}
            className={`border shadow-2xl shadow-black/20 rounded-2xl p-4 mb-3 w-[90%] flex-row items-center gap-3 ${bgClass}`}
            style={{ zIndex: 100 - index }}
          >
            {icon}
            <View className="flex-1">
              <Text className={`font-bold text-sm ${textClass}`}>{toast.title}</Text>
              {toast.description && (
                <Text className={`text-xs mt-0.5 ${descClass}`}>{toast.description}</Text>
              )}
            </View>
            {closeButton && (
              <Pressable 
                onPress={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 rounded-full active:bg-black/10 ml-2"
              >
                <X size={16} color={richColors ? "white" : "gray"} />
              </Pressable>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}
