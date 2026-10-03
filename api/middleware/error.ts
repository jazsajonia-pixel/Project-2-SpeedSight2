import { Context } from 'hono';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const errorHandler = (err: Error, c: Context) => {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    return c.json<ApiErrorResponse>(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid request data',
          details: err.errors,
        },
      },
      400
    );
  }

  return c.json<ApiErrorResponse>(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
      },
    },
    500
  );
};
