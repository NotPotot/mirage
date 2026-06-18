export interface Logger {
  debug(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  threat(msg: string, data?: unknown): void;
}

export function createLogger(debug: boolean): Logger {
  const prefix = '[Mirage]';
  return {
    debug: debug
      ? (msg, data) => console.log(`${prefix} ${msg}`, data ?? '')
      : () => {},
    warn: (msg, data) => console.warn(`${prefix} ${msg}`, data ?? ''),
    threat: (msg, data) =>
      console.warn(`${prefix} 🛡️ THREAT: ${msg}`, data ?? ''),
  };
}
