import { ok, error } from "@/models/response";

// try/catch wrapper
// runs the async function then wraps the result in a success shape
export const tryOk = async <T>(
  fn: () => Promise<T>,
  onError?: (err: unknown) => string,
) => {
  try {
    return ok(await fn());
  } catch (err) {
    const message = onError
      ? onError(err) // formatter
      : err instanceof Error
        ? err.message // native error message
        : "An error occurred"; // fallback
    return error(message);
  }
};
