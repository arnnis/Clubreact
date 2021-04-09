import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { ThemeContext } from "./context";
import { themes } from "./themes";

export const ThemeProvider: FC = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState<keyof typeof themes>(
    "defaultTheme"
  );
  const [loadingTheme, setLoadingTheme] = useState(true);

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("theme", currentThemeName);
    if (currentThemeName === "defaultTheme")
      StatusBar.setBarStyle("dark-content");
    if (currentThemeName === "nightTheme")
      StatusBar.setBarStyle("light-content");
  }, [currentThemeName]);

  const loadThemeFromStorage = async () => {
    setLoadingTheme(true);
    const themeName = (await AsyncStorage.getItem("theme")) as
      | keyof typeof themes
      | undefined;
    if (themeName) {
      setCurrentThemeName(themeName);
    }
    setLoadingTheme(false);
  };

  const toggleTheme = () => {
    if (currentThemeName === "defaultTheme") {
      setCurrentThemeName("nightTheme");
    } else {
      setCurrentThemeName("defaultTheme");
    }
  };

  if (loadingTheme) return null;

  return (
    <ThemeContext.Provider
      value={{ theme: themes[currentThemeName], toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
