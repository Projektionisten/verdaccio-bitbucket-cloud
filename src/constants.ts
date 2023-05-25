export enum CACHE_ENGINE {
	CACHE_IN_MEMORY = 'in-memory',
	CACHE_REDIS = 'redis'
}

export const ALLOWED_CACHE_ENGINES = [
	CACHE_ENGINE.CACHE_IN_MEMORY.toString(),
	CACHE_ENGINE.CACHE_REDIS.toString()
]

/**
 * Default cache time-to-live in seconds
 * It could be changed via config ttl option,
 * which should be also defined in seconds
 *
 * @type {number}
 * @access private
 */
export const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 7;
