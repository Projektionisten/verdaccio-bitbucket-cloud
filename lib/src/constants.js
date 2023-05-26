"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CACHE_TTL = exports.ALLOWED_CACHE_ENGINES = exports.CACHE_ENGINE = void 0;
var CACHE_ENGINE;
(function (CACHE_ENGINE) {
    CACHE_ENGINE["CACHE_IN_MEMORY"] = "in-memory";
    CACHE_ENGINE["CACHE_REDIS"] = "redis";
})(CACHE_ENGINE = exports.CACHE_ENGINE || (exports.CACHE_ENGINE = {}));
exports.ALLOWED_CACHE_ENGINES = [
    CACHE_ENGINE.CACHE_IN_MEMORY.toString(),
    CACHE_ENGINE.CACHE_REDIS.toString()
];
/**
 * Default cache time-to-live in seconds
 * It could be changed via config ttl option,
 * which should be also defined in seconds
 *
 * @type {number}
 * @access private
 */
exports.DEFAULT_CACHE_TTL = 24 * 60 * 60 * 7;
