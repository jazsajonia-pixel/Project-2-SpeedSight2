import { Context } from 'hono';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: err.issues.map(({ path, message }) => ({ path, message })),
        },
      },
      400
    );
  }

  if (err instanceof SyntaxError) {
    return c.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request body' } }, 400);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002' && c.req.path === '/api/auth/register') {
      return c.json(
        { error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email address already exists' } },
        400
      );
    }
    if (err.code === 'P2025') {
      return c.json(
        { error: { code: 'RESOURCE_CHANGED', message: 'Resource not found or changed. Refresh and try again.' } },
        409
      );
    }
  }

  console.error('API Error:', err);
  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected server error occurred.',
      },
    },
    500
  );
};
