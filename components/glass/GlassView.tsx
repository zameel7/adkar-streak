import { BlurView } from 'expo-blur';
import React from 'react';
import { View, ViewProps } from 'react-native';

export interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children?: React.ReactNode;
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
  const getGlassStyles = () => {
    const baseStyle = {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden' as const,
    };

    switch (glassStyle) {
      case 'light':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
        };
      case 'medium':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        };
      case 'strong':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.35)',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        };
    }
  };

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[{ borderRadius: 16 }, style]}
      {...props}
    >
      <View style={getGlassStyles()}>
        {children}
      </View>
    </BlurView>
  );
};