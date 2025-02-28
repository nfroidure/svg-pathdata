import { expect } from '@jest/globals';

export function assertThrows<T>(fn: () => void, type: T, message: string) {
  const expRes = expect(fn);
  expRes.toThrowError(message);
  expRes.toThrow(type);
}
