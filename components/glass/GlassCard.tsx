import React from 'react';
import { View, ViewProps } from 'react-native';
import { GlassView } from './GlassView';

export interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  padding?: 'none' | 'small' | 'medium' | 'large';
  glassStyle?: 'light' | 'medium' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 15,
  padding = 'medium',
  glassStyle = 'medium',
  style,
  ...props
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  return (
    <GlassView
      intensity={intensity}
      glassStyle={glassStyle}
      style={style}
      {...props}
    >
      <View className={getPaddingStyles()}>
        {children}
      </View>
    </GlassView>
  );
};