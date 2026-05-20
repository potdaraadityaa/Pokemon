import morgan from 'morgan';
import { config } from '../config';
import { morganStream } from '../utils/logger';

const format =
  config.env === 'production'
    ? 'combined'
    : ':method :url :status :response-time ms - :res[content-length]';

export const requestLogger = morgan(format, { stream: morganStream });
