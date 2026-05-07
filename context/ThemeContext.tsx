import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({theme: 'light', toggleTheme: (newTheme: string) => {}});

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [hydrated, setHydrated] = useState(false);
  const [hasSavedTheme, setHasSavedTheme] = useState(false);

  useEffect(() => {
    const getTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
          setHasSavedTheme(true);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setHydrated(true);
      }
    };
    getTheme();
  }, []);

  useEffect(() => {
    if (hydrated && !hasSavedTheme && colorScheme) {
      setTheme(colorScheme);
    }
  }, [hydrated, hasSavedTheme, colorScheme]);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    setHasSavedTheme(true);
    AsyncStorage.setItem('theme', newTheme).catch((e) =>
      console.log('Error saving theme:', e)
    );
  };

  return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeContext;