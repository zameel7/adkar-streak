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
        return { padding: 0 };
      case 'small':
        return { padding: 12 };
      case 'large':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  return (
    <GlassView
      intensity={intensity}
      glassStyle={glassStyle}
      style={style}
      {...props}
    >
      <View style={getPaddingStyles()}>
        {children}
      </View>
    </GlassView>
  );
};