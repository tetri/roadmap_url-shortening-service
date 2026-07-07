import { Request, Response, NextFunction } from 'express';
import * as urlService from '../services/url';
import { toUrlResponse, toUrlStatsResponse } from '../models/url';

export function createShortUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    const record = urlService.createShortUrl(req.body.url);
    res.status(201).json(toUrlResponse(record));
  } catch (err) {
    next(err);
  }
}

function getShortCode(req: Request): string {
  const code = req.params.shortCode;
  return Array.isArray(code) ? code[0] : code;
}

export function getOriginalUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    const shortCode = getShortCode(req);
    const record = urlService.getUrlByShortCode(shortCode);
    urlService.incrementAccessCount(shortCode);
    res.json(toUrlResponse({ ...record, access_count: record.access_count + 1 }));
  } catch (err) {
    next(err);
  }
}

export function updateShortUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    const shortCode = getShortCode(req);
    const record = urlService.updateShortUrl(shortCode, req.body.url);
    res.json(toUrlResponse(record));
  } catch (err) {
    next(err);
  }
}

export function deleteShortUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    const shortCode = getShortCode(req);
    urlService.deleteShortUrl(shortCode);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export function redirectToOriginalUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    const shortCode = getShortCode(req);
    const record = urlService.getUrlByShortCode(shortCode);
    urlService.incrementAccessCount(shortCode);
    res.redirect(302, record.url);
  } catch (err) {
    next(err);
  }
}

export function getUrlStats(req: Request, res: Response, next: NextFunction): void {
  try {
    const shortCode = getShortCode(req);
    const record = urlService.getUrlStats(shortCode);
    res.json(toUrlStatsResponse(record));
  } catch (err) {
    next(err);
  }
}
