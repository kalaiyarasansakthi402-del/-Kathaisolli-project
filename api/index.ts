import type { Request, Response } from 'express';
import handler from '../apps/api/api/index';

export default async function rootApiHandler(req: Request, res: Response) {
  return handler(req, res);
}
