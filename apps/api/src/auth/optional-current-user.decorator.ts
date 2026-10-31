import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthPrincipal } from './auth.types';

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthPrincipal | null => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user ?? null;
  },
);
