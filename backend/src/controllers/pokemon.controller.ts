import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { pokemonService } from '../services/pokemon.service';
import { successResponse } from '../utils/helpers';
import { AppError } from '../types/api.types';

// Helper: throw if express-validator found issues
function assertValid(req: Request): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw AppError.validationError(
      errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    );
  }
}

/**
 * GET /api/pokemon/:name
 */
export async function getPokemonByName(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    assertValid(req);
    const start = Date.now();
    const pokemon = await pokemonService.getPokemonByName(req.params['name'] as string);
    res.json(
      successResponse(pokemon, {
        requestId: req.headers['x-request-id'] as string,
        duration: Date.now() - start,
      }),
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pokemon/search?q=&page=&limit=
 */
export async function searchPokemon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    assertValid(req);
    const q = (req.query['q'] as string) ?? '';
    const page = parseInt((req.query['page'] as string) ?? '1', 10);
    const limit = parseInt((req.query['limit'] as string) ?? '20', 10);
    const start = Date.now();

    const results = await pokemonService.searchPokemon(q, page, limit);
    res.json(
      successResponse(results, {
        requestId: req.headers['x-request-id'] as string,
        duration: Date.now() - start,
      }),
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pokemon/random
 */
export async function getRandomPokemon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const start = Date.now();
    const pokemon = await pokemonService.getRandomPokemon();
    res.json(
      successResponse(pokemon, {
        requestId: req.headers['x-request-id'] as string,
        duration: Date.now() - start,
      }),
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pokemon/compare?names=pikachu,bulbasaur
 */
export async function comparePokemon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    assertValid(req);
    const namesParam = (req.query['names'] as string) ?? '';
    const names = namesParam
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length < 2) {
      throw AppError.badRequest('Provide at least 2 comma-separated Pokemon names in ?names=');
    }

    const start = Date.now();
    const result = await pokemonService.comparePokemon(names);
    res.json(
      successResponse(result, {
        requestId: req.headers['x-request-id'] as string,
        duration: Date.now() - start,
      }),
    );
  } catch (err) {
    next(err);
  }
}
