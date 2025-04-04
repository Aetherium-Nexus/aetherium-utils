import { BigNumber } from 'ethers';
import { LevelWithSilent, Logger, pino } from 'pino';

import { safelyAccessEnvVar } from './env.js';

// Level and format here should correspond with the agent options as much as possible

// A custom enum definition because pino does not export an enum
// and because we use 'off' instead of 'silent' to match the agent options
export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Off = 'off',
}

let logLevel: LevelWithSilent =
  toPinoLevel(safelyAccessEnvVar('LOG_LEVEL', true)) || 'info';

function toPinoLevel(level?: string): LevelWithSilent | undefined {
  if (level && pino.levels.values[level]) return level as LevelWithSilent;
  // For backwards compat and also to match agent level options
  else if (level === 'none' || level === 'off') return 'silent';
  else return undefined;
}

export function getLogLevel() {
  return logLevel;
}

export enum LogFormat {
  Pretty = 'pretty',
  JSON = 'json',
}
let logFormat: LogFormat = LogFormat.JSON;
const envLogFormat = safelyAccessEnvVar('LOG_FORMAT', true) as
  | LogFormat
  | undefined;
if (envLogFormat && Object.values(LogFormat).includes(envLogFormat))
  logFormat = envLogFormat;

export function getLogFormat() {
  return logFormat;
}

// Note, for brevity and convenience, the rootLogger is exported directly
export let rootLogger = createPinoLogger(logLevel, logFormat);

export function getRootLogger() {
  return rootLogger;
}

export function configureRootLogger(
  newLogFormat: LogFormat,
  newLogLevel: LogLevel,
) {
  logFormat = newLogFormat;
  logLevel = toPinoLevel(newLogLevel) || logLevel;
  rootLogger = createPinoLogger(logLevel, logFormat);
  return rootLogger;
}

export function setRootLogger(logger: Logger) {
  rootLogger = logger;
  return rootLogger;
}

export function createPinoLogger(
  logLevel: LevelWithSilent,
  logFormat: LogFormat,
) {
  return pino({
    level: logLevel,
    name: 'aetherium',
    formatters: {
      // Remove pino's default bindings of hostname but keep pid
      bindings: (defaultBindings) => ({ pid: defaultBindings.pid }),
    },
    hooks: {
      logMethod(inputArgs, method, level) {
        // Pino has no simple way of setting custom log shapes and they
        // recommend against using pino-pretty in production so when
        // pretty is enabled we circumvent pino and log directly to console
        if (
          logFormat === LogFormat.Pretty &&
          level >= pino.levels.values[logLevel]
        ) {
          // eslint-disable-next-line no-console
          console.log(...inputArgs);
          // Then return null to prevent pino from logging
          return null;
        }
        return method.apply(this, inputArgs);
      },
    },
  });
}

export function ethersBigNumberSerializer(key: string, value: any): any {
  // Check if the value looks like a serialized BigNumber
  if (
    typeof value === 'object' &&
    value !== null &&
    value.type === 'BigNumber' &&
    value.hex
  ) {
    return BigNumber.from(value.hex).toString();
  }
  return value;
}
