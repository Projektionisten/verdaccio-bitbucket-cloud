import { getUnauthorized } from '@verdaccio/commons-api';
import {
	AuthAccessCallback,
	AuthCallback,
	IPluginAuth,
	Logger,
	PackageAccess,
	PluginOptions,
	RemoteUser,
} from '@verdaccio/types';
import NodeCache from 'node-cache';
import { CustomConfig } from '../types/index';
import { ALLOWED_CACHE_ENGINES, CACHE_ENGINE, DEFAULT_CACHE_TTL } from './constants';
import { Bitbucket } from './model/bitbucket';
import { Hasher } from './passwordHasher';
import { getRedisClient } from './redis';

const $ALL = '$all';
const $AUTH = '$authenticated';

/**
 * Custom Verdaccio Authenticate Plugin.
 */
export default class AuthCustomPlugin implements IPluginAuth<CustomConfig> {
	public logger: Logger;
	private allow: any;
	private hasher: Hasher;
	private cache: any;
	private ttl: number;

	public constructor(config: CustomConfig, options: PluginOptions<CustomConfig>) {
		this.logger = options.logger;
		this.hasher = new Hasher(config);

		const cacheEngine = config.cache || false;
		if (config.cache && !ALLOWED_CACHE_ENGINES.includes(cacheEngine)) {
			throw Error(`Invalid cache engine ${cacheEngine}, please use on of these: [${ALLOWED_CACHE_ENGINES.join(', ')}]`);
		}

		switch (config.cache) {
			case CACHE_ENGINE.CACHE_REDIS:
				if (!config.redis) {
					throw Error('Can\'t find Redis configuration');
				}
				this.cache = getRedisClient(config.redis);
				break;
			case CACHE_ENGINE.CACHE_IN_MEMORY:
				this.cache = new NodeCache();
				break;
			default:
				this.cache = false;
		}

		this.allow = this.parseAllow(config.allow);
		this.ttl = (config.ttl || DEFAULT_CACHE_TTL) * 1000;

		return this;
	}
	/**
	 * Authenticate an user.
	 * @param user user to log
	 * @param password provided password
	 * @param cb callback function
	 */
	public async authenticate(username: string, password: string, cb: AuthCallback): Promise<void> {
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
				let cached = await this.cache.get(username);
				if (cached) {
					cached = JSON.parse(cached);
				}
				if (cached && await this.hasher.verify({ password, hash: cached.password })) {
					return cb(null, cached.teams);
				}
			} catch (err: unknown) {
				this.logger.warn('Cant get from cache', err as string);
			}
		}
		const bitbucket = new Bitbucket(
			username,
			password,
			this.logger,
		);

		return bitbucket.getPrivileges().then(async (privileges) => {
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
				const hashedPassword = await this.hasher.hash(password);
				try {
					await this.cache.set(username, JSON.stringify({ teams, password: hashedPassword }), 'EX', this.ttl);
				} catch (err: unknown) {
					this.logger.warn('Cant save to cache', err as string);
				}
			}

			return cb(null, teams);
		}).catch((err) => {
			this.logError(this.logger, err, username);
			return cb(err, false);
		});
	}

	/**
	 * Triggered on each access request
	 * @param user
	 * @param pkg
	 * @param cb
	 */
	public allow_access(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
		const access = this.allow || {};

		if (Object.prototype.hasOwnProperty.call(access, $ALL)) {
			return cb(null, true);
		}

		if (user.name === undefined) {
			return cb(getUnauthorized('Acces denied. User is not authenticated.'), false);
		}

		if (this.matchAccessRules(user, access, pkg, 'access')) {
			return cb(null, true);
		} else {
			return cb(
				getUnauthorized(
					'Access denied. User does not have the required groups.'
				),
				false
			);
		}
	}

	/**
	 * Triggered on each publish request
	 * @param user
	 * @param pkg
	 * @param cb
	 */
	public allow_publish(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void {
		const access = this.allow || {};

		if (Object.prototype.hasOwnProperty.call(access, $ALL)) {
			return cb(null, true);
		}

		if (user.name === undefined) {
			return cb(getUnauthorized('Acces denied. User is not authenticated.'), false);
		}

		if (this.matchAccessRules(user, access, pkg, 'publish')) {
			return cb(null, true);
		} else {
			return cb(
				getUnauthorized(
					'Access denied. User does not have the required groups.'
				),
				false
			);
		}
	}

	private matchAccessRules(user: RemoteUser, access: any, pkg: PackageAccess, accessType: 'access' | 'publish') {

		if (Object.prototype.hasOwnProperty.call(access, $AUTH)) {
			return true;
		}

		if (pkg[accessType] !== undefined && pkg[accessType]?.some((group) => access[group] !== undefined)) {
			return true;
		}

		if (user.real_groups !== undefined && user.real_groups.some((group) => access[group] !== undefined)) {
			return true;
		}

		return false;
	}

	/**
	 * Parses config allow option and returns result
	 *
	 * @param {string} allow - string to parse
	 * @returns {Object}
	 */
	private parseAllow (allow) {
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
	private logError (logger, err, username) {
		logger.warn(`${err.code}, user: ${username}, Bitbucket API adaptor error: ${err.message}`);
	}
}
