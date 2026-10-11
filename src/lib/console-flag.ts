/** The staging console is only reachable when CONSOLE_ENABLED=on (never on the public site). */
export function consoleEnabled(): boolean {
  return process.env.CONSOLE_ENABLED === "on";
}
