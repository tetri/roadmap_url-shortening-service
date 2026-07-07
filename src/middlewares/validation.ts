import { Request, Response, NextFunction } from 'express';

const URL_REGEX = /^https?:\/\/.+/i;

export function validateCreateUrl(req: Request, res: Response, next: NextFunction): void {
  const { url } = req.body;

  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('url is required and must be a string');
  } else if (!URL_REGEX.test(url.trim())) {
    errors.push('url must be a valid HTTP or HTTPS URL');
  } else if (url.trim().length > 2048) {
    errors.push('url must not exceed 2048 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  req.body.url = url.trim();
  next();
}

export function validateUpdateUrl(req: Request, res: Response, next: NextFunction): void {
  const { url } = req.body;

  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('url is required and must be a string');
  } else if (!URL_REGEX.test(url.trim())) {
    errors.push('url must be a valid HTTP or HTTPS URL');
  } else if (url.trim().length > 2048) {
    errors.push('url must not exceed 2048 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  req.body.url = url.trim();
  next();
}
