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
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return 'text-3xl font-bold leading-tight';
      case 'subtitle':
        return 'text-xl font-semibold';
      case 'caption':
        return 'text-sm font-medium';
      case 'link':
        return 'text-base font-medium underline';
      default:
        return 'text-base font-normal';
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      case 'black':
        return 'text-black';
      case 'muted':
        return 'text-white/70';
      default:
        return 'text-white';
    }
  };

  const combinedClassName = `${getVariantStyles()} ${getColorStyles()} ${className || ''}`.trim();

  return (
    <Text
      className={combinedClassName}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};