import { createContext, useContext, useCallback, useRef, useEffect } from "react";

type Listener = () => void;

interface OverlayCloseContextType {
  subscribe: (listener: Listener) => () => void;
  closeAll: () => void;
}

const OverlayCloseContext = createContext<OverlayCloseContextType>({
  subscribe: () => () => {},
  closeAll: () => {},
});

export const useOverlayClose = () => useContext(OverlayCloseContext);

export const OverlayCloseProvider = ({ children }: { children: React.ReactNode }) => {
  const listeners = useRef<Set<Listener>>(new Set());

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => { listeners.current.delete(listener); };
  }, []);

  const closeAll = useCallback(() => {
    listeners.current.forEach(fn => fn());
  }, []);

  return (
    <OverlayCloseContext.Provider value={{ subscribe, closeAll }}>
      {children}
    </OverlayCloseContext.Provider>
  );
};
