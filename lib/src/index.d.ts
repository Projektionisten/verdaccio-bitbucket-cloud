import { AuthAccessCallback, AuthCallback, IPluginAuth, Logger, PackageAccess, PluginOptions, RemoteUser } from '@verdaccio/types';
import { CustomConfig } from '../types/index';
/**
 * Custom Verdaccio Authenticate Plugin.
 */
export default class AuthCustomPlugin implements IPluginAuth<CustomConfig> {
    logger: Logger;
    private allow;
    private hasher;
    private cache;
    private ttl;
    constructor(config: CustomConfig, options: PluginOptions<CustomConfig>);
    /**
     * Authenticate an user.
     * @param user user to log
     * @param password provided password
     * @param cb callback function
     */
    authenticate(username: string, password: string, cb: AuthCallback): Promise<void>;
    /**
     * Triggered on each access request
     * @param user
     * @param pkg
     * @param cb
     */
    allow_access(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void;
    /**
     * Triggered on each publish request
     * @param user
     * @param pkg
     * @param cb
     */
    allow_publish(user: RemoteUser, pkg: PackageAccess, cb: AuthAccessCallback): void;
    private matchAccessRules;
    /**
     * Parses config allow option and returns result
     *
     * @param {string} allow - string to parse
     * @returns {Object}
     */
    private parseAllow;
    /**
     * Logs a given error
     * This is private method running in context of Auth object
     *
     * @param {object} logger
     * @param {string} err
     * @param {string} username
     * @access private
     */
    private logError;
}
