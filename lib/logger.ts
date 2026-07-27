type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function emit(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    emit("debug", message, context),
  info: (message: string, context?: LogContext) =>
    emit("info", message, context),
  warn: (message: string, context?: LogContext) =>
    emit("warn", message, context),
  error: (message: string, context?: LogContext) =>
    emit("error", message, context),
  child: (base: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      emit("debug", message, { ...base, ...context }),
    info: (message: string, context?: LogContext) =>
      emit("info", message, { ...base, ...context }),
    warn: (message: string, context?: LogContext) =>
      emit("warn", message, { ...base, ...context }),
    error: (message: string, context?: LogContext) =>
      emit("error", message, { ...base, ...context }),
  }),
};
