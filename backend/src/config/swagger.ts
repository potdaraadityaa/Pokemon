import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Pokemon Pokedex API',
      version,
      description:
        'A production-grade REST API for searching and exploring Pokemon data, powered by PokeAPI with Redis/LRU caching.',
      contact: {
        name: 'Pokemon Pokedex API',
        url: 'https://github.com/your-username/pokemon-pokedex-api',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local Development',
      },
    ],
    tags: [
      { name: 'Pokemon', description: 'Pokemon data endpoints' },
      { name: 'Health', description: 'Service health and status' },
    ],
    components: {
      schemas: {
        Meta: {
          type: 'object',
          properties: {
            requestId: { type: 'string', format: 'uuid' },
            timestamp: { type: 'string', format: 'date-time' },
            duration: { type: 'number', description: 'Response time in milliseconds' },
            cached: { type: 'boolean' },
            cacheSource: { type: 'string', enum: ['redis', 'memory', 'none'] },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              enum: ['NOT_FOUND', 'BAD_REQUEST', 'VALIDATION_ERROR', 'UPSTREAM_ERROR', 'TIMEOUT', 'RATE_LIMITED', 'INTERNAL_ERROR'],
            },
            message: { type: 'string' },
          },
        },
        PokemonStat: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'hp' },
            baseStat: { type: 'integer', example: 45 },
            effort: { type: 'integer', example: 0 },
          },
        },
        PokemonAbility: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'static' },
            isHidden: { type: 'boolean' },
            slot: { type: 'integer' },
          },
        },
        PokemonSprites: {
          type: 'object',
          properties: {
            frontDefault: { type: 'string', nullable: true },
            backDefault: { type: 'string', nullable: true },
            frontShiny: { type: 'string', nullable: true },
            officialArtwork: { type: 'string', nullable: true },
            dreamWorld: { type: 'string', nullable: true },
            home: { type: 'string', nullable: true },
          },
        },
        PokemonDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 25 },
            name: { type: 'string', example: 'pikachu' },
            height: { type: 'integer', description: 'Height in decimetres', example: 4 },
            weight: { type: 'integer', description: 'Weight in hectograms', example: 60 },
            baseExperience: { type: 'integer', nullable: true },
            types: { type: 'array', items: { type: 'string' }, example: ['electric'] },
            abilities: { type: 'array', items: { $ref: '#/components/schemas/PokemonAbility' } },
            stats: { type: 'array', items: { $ref: '#/components/schemas/PokemonStat' } },
            sprites: { $ref: '#/components/schemas/PokemonSprites' },
            moves: { type: 'array', items: { type: 'string' } },
            species: { type: 'string' },
            isLegendary: { type: 'boolean' },
            isMythical: { type: 'boolean' },
            isBaby: { type: 'boolean' },
            generation: { type: 'string', example: 'generation-i' },
            color: { type: 'string', example: 'yellow' },
            shape: { type: 'string', nullable: true },
            habitat: { type: 'string', nullable: true },
            description: { type: 'string' },
            genus: { type: 'string', example: 'Mouse Pokémon' },
            captureRate: { type: 'integer' },
            baseHappiness: { type: 'integer', nullable: true },
            eggGroups: { type: 'array', items: { type: 'string' } },
            evolvesFrom: { type: 'string', nullable: true },
          },
        },
        PokemonListItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            url: { type: 'string' },
            sprite: { type: 'string', nullable: true },
          },
        },
        SearchResult: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            results: { type: 'array', items: { $ref: '#/components/schemas/PokemonListItem' } },
            query: { type: 'string' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        StatComparison: {
          type: 'object',
          properties: {
            stat: { type: 'string' },
            values: { type: 'object', additionalProperties: { type: 'integer' } },
            winner: { type: 'string', nullable: true },
          },
        },
      },
    },
  },
  // Works from both ts-node (src/) and compiled dist/ — scans both .ts and .js
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
