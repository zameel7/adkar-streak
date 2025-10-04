import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({theme: 'light', toggleTheme: (newTheme: string) => {}});

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme from storage
    const getTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    getTheme();
  }, []);

  useEffect(() => {
    // set theme to system selected theme
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    // Save selected theme to storage
    AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeContext;