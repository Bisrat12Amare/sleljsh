import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Child } from "@workspace/api-client-react";

interface ChildContextType {
  selectedChildId: number | null;
  setSelectedChildId: (id: number | null) => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const [selectedChildId, setSelectedChildIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem("selelgesh_child_id");
    return stored ? parseInt(stored, 10) : null;
  });

  const setSelectedChildId = (id: number | null) => {
    if (id !== null) {
      localStorage.setItem("selelgesh_child_id", id.toString());
    } else {
      localStorage.removeItem("selelgesh_child_id");
    }
    setSelectedChildIdState(id);
  };

  return (
    <ChildContext.Provider value={{ selectedChildId, setSelectedChildId }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChildContext() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error("useChildContext must be used within a ChildProvider");
  }
  return context;
}
