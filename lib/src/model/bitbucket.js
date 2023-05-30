"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bitbucket = void 0;
const API_URL = 'https://api.bitbucket.org';
const API_VERSION = '2.0';
class Bitbucket {
    constructor(username, password, logger) {
        this.apiUrl = `${API_URL}/${API_VERSION}`;
        this.userName = username;
        this.password = password;
        this.logger = logger;
    }
    getUser() {
        // currently not in use, maybe in the future it will be.
        return fetch(`${this.apiUrl}/user`, {
            method: 'get',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`)
            })
        }).then((response) => response.json())
            .catch((error) => {
            this.logger.error("Error getting User:" + error);
        });
    }
    getTeams(role) {
        let teams = [];
        const endpoint = `${this.apiUrl}/workspaces?role=${role}&pagelen=100`;
        this.logger.debug(`[bitbucket] getting teams for ${this.userName}, url: ${endpoint}, role: ${role}`);
        const callApi = (url) => {
            return new Promise((resolve) => {
                fetch(url, {
                    method: 'get',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`)
                    })
                })
                    .then((response) => response.json())
                    .then((response) => {
                    var _a;
                    // this.logger.debug("getTeams: " + JSON.stringify(response, null, 2));
                    const teamValues = (_a = response === null || response === void 0 ? void 0 : response.values) === null || _a === void 0 ? void 0 : _a.map((x) => x.slug);
                    if (teamValues !== undefined && teamValues.length !== 0) {
                        teams = [
                            ...teams,
                            ...teamValues
                        ];
                    }
                    if (response === null || response === void 0 ? void 0 : response.next)
                        return callApi(response.next);
                    resolve({ role, teams });
                }).catch((error) => {
                    this.logger.error("Error getting Teams:" + error);
                });
            });
        };
        return callApi(`${endpoint}`);
    }
    getPrivileges() {
        return Promise.all([
            this.getTeams('member'),
            this.getTeams('collaborator'),
            this.getTeams('owner'),
        ]).then((values) => {
            let result = {};
            values.forEach(({ role, teams }) => {
                for (const team of teams) {
                    result = Object.assign(Object.assign({}, result), { [team]: role });
                }
            });
            return { teams: result };
        });
    }
}
exports.Bitbucket = Bitbucket;
