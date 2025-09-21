import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
  glassStyle?: 'light' | 'medium' | 'strong';
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 15,
  tint = 'light',
  glassStyle = 'medium',
  style,
  ...props
}) => {
  const getGlassOpacity = () => {
    switch (glassStyle) {
      case 'light': return 'bg-white/10 border-white/15';
      case 'medium': return 'bg-white/20 border-white/25';
      case 'strong': return 'bg-white/30 border-white/35';
      default: return 'bg-white/20 border-white/25';
    }
  };

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[{ borderRadius: 16 }, style]}
    >
      <View
        className={`${getGlassOpacity()} border rounded-2xl overflow-hidden`}
        {...props}
      >
        {children}
      </View>
    </BlurView>
  );
};