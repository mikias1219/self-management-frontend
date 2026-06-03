"use client";

import { createContext, useContext } from "react";

const HubContext = createContext(false);

export function HubProvider({ children }: { children: React.ReactNode }) {
  return (
    <HubContext.Provider value={true}>{children}</HubContext.Provider>
  );
}

export function useHubEmbedded() {
  return useContext(HubContext);
}
