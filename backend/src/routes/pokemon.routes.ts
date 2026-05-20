import { Router } from 'express';
import {
  getPokemonByName,
  searchPokemon,
  getRandomPokemon,
  comparePokemon,
} from '../controllers/pokemon.controller';
import {
  validateGetPokemon,
  validateSearch,
  validateCompare,
} from '../validators/pokemon.validator';

const router = Router();

/**
 * @openapi
 * /pokemon/search:
 *   get:
 *     summary: Search Pokemon by name (partial match)
 *     tags: [Pokemon]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (partial Pokemon name)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of matching Pokemon
 *       400:
 *         description: Bad request
 */
router.get('/search', validateSearch, searchPokemon);

/**
 * @openapi
 * /pokemon/random:
 *   get:
 *     summary: Get a random Pokemon
 *     tags: [Pokemon]
 *     responses:
 *       200:
 *         description: A random Pokemon detail object
 */
router.get('/random', getRandomPokemon);

/**
 * @openapi
 * /pokemon/compare:
 *   get:
 *     summary: Compare two or more Pokemon side-by-side
 *     tags: [Pokemon]
 *     parameters:
 *       - in: query
 *         name: names
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of Pokemon names/IDs (2-6)
 *         example: pikachu,bulbasaur,charmander
 *     responses:
 *       200:
 *         description: Comparison result with per-stat winners
 *       400:
 *         description: Bad request
 */
router.get('/compare', validateCompare, comparePokemon);

/**
 * @openapi
 * /pokemon/{name}:
 *   get:
 *     summary: Get Pokemon by name or Pokedex ID
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Pokemon name (e.g. pikachu) or numeric ID (e.g. 25)
 *     responses:
 *       200:
 *         description: Full Pokemon detail
 *       404:
 *         description: Pokemon not found
 */
router.get('/:name', validateGetPokemon, getPokemonByName);

export default router;
