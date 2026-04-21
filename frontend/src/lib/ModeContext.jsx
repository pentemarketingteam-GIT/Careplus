import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const location = useLocation();
  const isAIRoute = location.pathname.startsWith("/ai");
  const [mode, setMode] = useState(isAIRoute ? "dynamic" : "static");

  // Keep mode in sync with route
  useEffect(() => {
    setMode(isAIRoute ? "dynamic" : "static");
  }, [isAIRoute]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
  );
}

export const useMode = () => useContext(ModeContext);
