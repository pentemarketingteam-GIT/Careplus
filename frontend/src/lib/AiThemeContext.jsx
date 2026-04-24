import { createContext, useContext, useEffect, useState } from "react";

const AiThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function AiThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("careplus-ai-theme") || "light");
  useEffect(() => {
    localStorage.setItem("careplus-ai-theme", theme);
  }, [theme]);
  return <AiThemeContext.Provider value={{ theme, setTheme }}>{children}</AiThemeContext.Provider>;
}

export const useAiTheme = () => useContext(AiThemeContext);
