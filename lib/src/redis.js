"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const redis_1 = require("redis");
const getRedisClient = (redisOptions) => {
    const client = (0, redis_1.createClient)(redisOptions);
    return client;
};
exports.getRedisClient = getRedisClient;
