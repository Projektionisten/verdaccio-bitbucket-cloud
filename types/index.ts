import { Config } from '@verdaccio/types';

export interface CustomConfig extends Config {
  allow: string;
  ttl: number;
  hashPassword: boolean;
  cache: 'redis' | 'in-memory';
  redis: any;
}
