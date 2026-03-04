import { describe, it, expect } from 'vitest';
import { ErrorHandler } from '../src/utils/errorHandling';

describe('ErrorHandler', () => {
  it('should handle string errors', () => {
    // We can't easily test toast in vitest without more setup, 
    // but we can check if it doesn't crash
    expect(() => ErrorHandler.handle('Test error')).not.toThrow();
  });

  it('should handle Error objects', () => {
    expect(() => ErrorHandler.handle(new Error('Test error object'))).not.toThrow();
  });
});
