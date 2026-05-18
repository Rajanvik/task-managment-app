import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BackgroundBlobs() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      {/* Top Left Blob */}
      <View 
        pointerEvents="none"
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] z-0"
      >
        <Svg width="300" height="300" viewBox="0 0 300 300">
          <Defs>
            <RadialGradient id="topLeftBlob" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop 
                offset="0%" 
                stopColor={colorScheme === 'dark' ? '#fafafa' : '#171717'} 
                stopOpacity={colorScheme === 'dark' ? 0.06 : 0.03} 
              />
              <Stop 
                offset="50%" 
                stopColor={colorScheme === 'dark' ? '#fafafa' : '#171717'} 
                stopOpacity={colorScheme === 'dark' ? 0.02 : 0.01} 
              />
              <Stop 
                offset="100%" 
                stopColor={colorScheme === 'dark' ? '#09090b' : '#ffffff'} 
                stopOpacity={0} 
              />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="150" r="150" fill="url(#topLeftBlob)" />
        </Svg>
      </View>

      {/* Bottom Right Blob */}
      <View 
        pointerEvents="none"
        className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] z-0"
      >
        <Svg width="350" height="350" viewBox="0 0 350 350">
          <Defs>
            <RadialGradient id="bottomRightBlob" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop 
                offset="0%" 
                stopColor={colorScheme === 'dark' ? '#fafafa' : '#171717'} 
                stopOpacity={colorScheme === 'dark' ? 0.05 : 0.02} 
              />
              <Stop 
                offset="60%" 
                stopColor={colorScheme === 'dark' ? '#fafafa' : '#171717'} 
                stopOpacity={colorScheme === 'dark' ? 0.015 : 0.007} 
              />
              <Stop 
                offset="100%" 
                stopColor={colorScheme === 'dark' ? '#09090b' : '#ffffff'} 
                stopOpacity={0} 
              />
            </RadialGradient>
          </Defs>
          <Circle cx="175" cy="175" r="175" fill="url(#bottomRightBlob)" />
        </Svg>
      </View>
    </>
  );
}
