import type { ComponentType, ReactNode } from "react";
import * as React from "react";

type TransitionProps = {
  children?: ReactNode;
  enter?: string;
  exit?: string;
  default?: string;
};

function viewTransitionType(): ComponentType<TransitionProps> | null {
  const maybe = (React as unknown as { ViewTransition?: unknown })
    .ViewTransition;
  if (typeof maybe === "function" || typeof maybe === "symbol") {
    return maybe as ComponentType<TransitionProps>;
  }
  return null;
}

/**
 * Crossfade plus a short rise on the page body. The header and footer keep
 * their own view-transition names so they stay put. When the runtime has no
 * ViewTransition export, children render unchanged.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const Transition = viewTransitionType();
  if (!Transition) return children;
  return (
    <Transition enter="route-rise" exit="route-fade" default="none">
      {children}
    </Transition>
  );
}
