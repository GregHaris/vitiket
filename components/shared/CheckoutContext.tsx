'use client';

import { CheckoutContextType } from '@/types';
import { createContext, useContext, useState, useCallback } from 'react';



const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<(() => void)[]>([]);

  const resetCheckout = useCallback(() => {
    listeners.forEach((listener) => listener());
  }, [listeners]);

  const onResetCheckout = useCallback((callback: () => void) => {
    setListeners((prev) => [...prev, callback]);
    return () => {
      setListeners((prev) => prev.filter((l) => l !== callback));
    };
  }, []);

  return (
    <CheckoutContext.Provider value={{ resetCheckout, onResetCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
