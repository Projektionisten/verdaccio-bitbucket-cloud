export declare enum CACHE_ENGINE {
    CACHE_IN_MEMORY = "in-memory",
    CACHE_REDIS = "redis"
}
export declare const ALLOWED_CACHE_ENGINES: string[];
/**
 * Default cache time-to-live in seconds
 * It could be changed via config ttl option,
 * which should be also defined in seconds
 *
 * @type {number}
 * @access private
 */
export declare const DEFAULT_CACHE_TTL: number;
