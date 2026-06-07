import { createContext, useContext, type ReactNode } from 'react';
import { useNavPhysics, type NavPhysicsApi } from './useNavPhysics';

const NavPhysicsContext = createContext<NavPhysicsApi | null>(null);

export function NavPhysicsProvider({ children }: { children: ReactNode }) {
  const physics = useNavPhysics();
  return <NavPhysicsContext.Provider value={physics}>{children}</NavPhysicsContext.Provider>;
}

export function useNavPhysicsContext(): NavPhysicsApi {
  const ctx = useContext(NavPhysicsContext);
  if (!ctx) {
    throw new Error('useNavPhysicsContext must be used within NavPhysicsProvider');
  }
  return ctx;
}
