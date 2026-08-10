export type Result<T> = { success: true; data: T } | { success: false; error: Error };

export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = <T>(error: Error): Result<T> => ({ success: false, error });
