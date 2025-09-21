import React from 'react';
import { Text, TextProps } from 'react-native';

export interface GlassTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'link';
  color?: 'primary' | 'secondary' | 'white' | 'black' | 'muted';
}

export const GlassText: React.FC<GlassTextProps> = ({
  children,
  variant = 'default',
  color = 'white',
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return { fontSize: 30, fontWeight: 'bold', lineHeight: 36 };
      case 'subtitle':
        return { fontSize: 20, fontWeight: '600' };
      case 'caption':
        return { fontSize: 14, fontWeight: '500' };
      case 'link':
        return { fontSize: 16, fontWeight: '500', textDecorationLine: 'underline' as const };
      default:
        return { fontSize: 16, fontWeight: 'normal' };
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return { color: '#61B553' };
      case 'secondary':
        return { color: '#28A766' };
      case 'black':
        return { color: '#000000' };
      case 'muted':
        return { color: 'rgba(255, 255, 255, 0.7)' };
      default:
        return { color: '#ffffff' };
    }
  };

  const combinedStyle = [getVariantStyles(), getColorStyles(), style];

  return (
    <Text
      style={combinedStyle}
      {...props}
    >
      {children}
    </Text>
  );
};