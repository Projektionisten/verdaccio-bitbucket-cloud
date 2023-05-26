"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
const constants_1 = require("./constants");
const bitbucket_1 = require("./model/bitbucket");
const passwordHasher_1 = require("./passwordHasher");
const redis_1 = require("./redis");
/**
 * Custom Verdaccio Authenticate Plugin.
 */
class AuthCustomPlugin {
    constructor(config, options) {
        this.logger = options.logger;
        this.hasher = new passwordHasher_1.Hasher(config);
        const cacheEngine = config.cache || false;
        if (config.cache && !constants_1.ALLOWED_CACHE_ENGINES.includes(cacheEngine)) {
            throw Error(`Invalid cache engine ${cacheEngine}, please use on of these: [${constants_1.ALLOWED_CACHE_ENGINES.join(', ')}]`);
        }
        switch (config.cache) {
            case constants_1.CACHE_ENGINE.CACHE_REDIS:
                if (!config.redis) {
                    throw Error('Can\'t find Redis configuration');
                }
                this.cache = (0, redis_1.getRedisClient)(config.redis);
                break;
            case constants_1.CACHE_ENGINE.CACHE_IN_MEMORY:
                this.cache = new node_cache_1.default();
                break;
            default:
                this.cache = false;
        }
        this.allow = this.parseAllow(config.allow);
        this.ttl = (config.ttl || constants_1.DEFAULT_CACHE_TTL) * 1000;
        return this;
    }
    /**
     * Authenticate an user.
     * @param user user to log
     * @param password provided password
     * @param cb callback function
     */
    authenticate(username, password, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * This code is just an example for demostration purpose
              if (this.foo) {
                cb(null, ['group-foo', 'group-bar']);
              } else {
                cb(getInternalError("error, try again"), false);
              }
            */
            if (this.cache) {
                try {
                    let cached = yield this.cache.get(username);
                    if (cached) {
                        cached = JSON.parse(cached);
                    }
                    if (cached && (yield this.hasher.verify({ password, hash: cached.password }))) {
                        return cb(null, cached.teams);
                    }
                }
                catch (err) {
                    this.logger.warn('Cant get from cache', err);
                }
            }
            const bitbucket = new bitbucket_1.Bitbucket(username, password, this.logger);
            return bitbucket.getPrivileges().then((privileges) => __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Get Privileges: ' + JSON.stringify(privileges, null, 2));
                const teams = Object.keys(privileges.teams).filter((team) => {
                    if (this.allow[team] === undefined) {
                        return false;
                    }
                    if (!this.allow[team].length) {
                        return true;
                    }
                    return this.allow[team].includes(privileges.teams[team]);
                }, this);
                if (this.cache) {
                    const hashedPassword = yield this.hasher.hash(password);
                    try {
                        yield this.cache.set(username, JSON.stringify({ teams, password: hashedPassword }), 'EX', this.ttl);
                    }
                    catch (err) {
                        this.logger.warn('Cant save to cache', err);
                    }
                }
                return cb(null, teams);
            })).catch((err) => {
                this.logError(this.logger, err, username);
                return cb(err, false);
            });
        });
    }
    /**
     * Triggered on each access request
     * @param user
     * @param pkg
     * @param cb
     */
    allow_access(user, pkg, cb) {
        /**
         * This code is just an example for demostration purpose
        if (user.name === this.foo && pkg?.access?.includes[user.name]) {
          this.logger.debug({name: user.name}, 'your package has been granted for @{name}');
          cb(null, true)
        } else {
          this.logger.error({name: user.name}, '@{name} is not allowed to access this package');
           cb(getInternalError("error, try again"), false);
        }
         */
    }
    /**
     * Triggered on each publish request
     * @param user
     * @param pkg
     * @param cb
     */
    allow_publish(user, pkg, cb) {
        /**
         * This code is just an example for demostration purpose
        if (user.name === this.foo && pkg?.access?.includes[user.name]) {
          this.logger.debug({name: user.name}, '@{name} has been granted to publish');
          cb(null, true)
        } else {
          this.logger.error({name: user.name}, '@{name} is not allowed to publish this package');
           cb(getInternalError("error, try again"), false);
        }
         */
    }
    allow_unpublish(user, pkg, cb) {
        /**
         * This code is just an example for demostration purpose
        if (user.name === this.foo && pkg?.access?.includes[user.name]) {
          this.logger.debug({name: user.name}, '@{name} has been granted to unpublish');
          cb(null, true)
        } else {
          this.logger.error({name: user.name}, '@{name} is not allowed to publish this package');
          cb(getInternalError("error, try again"), false);
        }
         */
    }
    /**
     * Parses config allow option and returns result
     *
     * @param {string} allow - string to parse
     * @returns {Object}
     */
    parseAllow(allow) {
        const result = {};
        allow.split(/\s*,\s*/).forEach((team) => {
            const newTeam = team.trim().match(/^(.*?)(\((.*?)\))?$/);
            result[newTeam[1]] = newTeam[3] ? newTeam[3].split('|') : [];
        });
        return result;
    }
    /**
     * Logs a given error
     * This is private method running in context of Auth object
     *
     * @param {object} logger
     * @param {string} err
     * @param {string} username
     * @access private
     */
    logError(logger, err, username) {
        logger.warn(`${err.code}, user: ${username}, Bitbucket API adaptor error: ${err.message}`);
    }
}
exports.default = AuthCustomPlugin;
