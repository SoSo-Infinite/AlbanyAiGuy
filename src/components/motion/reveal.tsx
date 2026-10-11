import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealTag =
  | "div"
  | "section"
  | "li"
  | "article"
  | "ul"
  | "ol"
  | "dl"
  | "p";

/**
 * Scroll reveal. The class is visible in the server HTML. Motion is applied
 * only from a stylesheet (@supports animation-timeline) or, for older
 * browsers, one shared observer that adds a class after paint.
 */
export function Reveal({
  as = "div",
  className,
  stagger = false,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  stagger?: boolean;
  children?: ReactNode;
}) {
  return createElement(
    as,
    {
      ...props,
      className: cn(stagger ? "reveal-grid" : "reveal", className),
    },
    children,
  );
}
