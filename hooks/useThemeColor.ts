/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useContext } from 'react';
import ThemeContext from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const {theme} = useContext(ThemeContext); 
  const colorFromProps = props[theme === 'light' ? 'light' : 'dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme === 'light' ? 'light' : 'dark'][colorName];
  }
}
