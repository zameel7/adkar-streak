import React from 'react';
import { GlassText, GlassTextProps } from './glass/GlassText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = Omit<GlassTextProps, 'variant' | 'color'> & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getVariant = () => {
    switch (type) {
      case 'title': return 'title';
      case 'subtitle': return 'subtitle';
      case 'link': return 'link';
      case 'defaultSemiBold': return 'default';
      default: return 'default';
    }
  };

  const getGlassColor = () => {
    if (lightColor || darkColor) {
      return 'white'; // Let the theme color override through style
    }
    return 'white';
  };

  return (
    <GlassText
      variant={getVariant()}
      color={getGlassColor()}
      style={[
        { color: themeColor },
        type === 'defaultSemiBold' && { fontWeight: '600' },
      ]}
      {...rest}
    />
  );
}
