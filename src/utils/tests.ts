/**
 * @file /utils/tests.js
 * @module /utils
 * @description function to get error from async call
 */

export class NoErrorThrownError extends Error {}

export async function getError(call: () => Promise<unknown>): Promise<unknown> {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error) {
    return error;
  }
}
