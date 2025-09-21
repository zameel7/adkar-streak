import React from 'react';
import { View, type ViewProps } from 'react-native';
import { GlassView, GlassViewProps } from './glass/GlassView';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  glass?: boolean;
  glassIntensity?: number;
  glassStyle?: 'light' | 'medium' | 'strong';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  glass = false,
  glassIntensity = 15,
  glassStyle = 'medium',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (glass) {
    return (
      <GlassView
        intensity={glassIntensity}
        glassStyle={glassStyle}
        style={style}
        {...otherProps}
      />
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
