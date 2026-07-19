import React, { createContext, useContext } from 'react';

type CoupleContextValue = {
  userId: string;
  coupleId: string;
  isSoloMode: boolean;
};

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({
  userId,
  coupleId,
  isSoloMode,
  children,
}: CoupleContextValue & { children: React.ReactNode }) {
  return (
    <CoupleContext.Provider value={{ userId, coupleId, isSoloMode }}>
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple(): CoupleContextValue {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple debe usarse dentro de un CoupleProvider');
  return ctx;
}
