import React, { useContext } from "react";
import { Theme, themes } from "./themes";

interface ContextValue {
  theme: Theme;
  toggleTheme(): void;
}

export const ThemeContext = React.createContext({
  theme: themes["nightTheme"],
  toggleTheme: () => {},
} as ContextValue);

export const useTheme = () => useContext(ThemeContext);
