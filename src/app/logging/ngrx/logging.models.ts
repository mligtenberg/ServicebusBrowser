export interface ILogItem {
    message: string;
    level: LogLevel;
}

export enum LogLevel {
    verbose,
    info,
    warning,
    error
}