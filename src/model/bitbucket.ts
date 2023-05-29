import {
	Logger
} from '@verdaccio/types';

const API_URL = 'https://api.bitbucket.org';
const API_VERSION = '2.0';

export class Bitbucket {
	private apiUrl: string;
	private userName: string;
	private password: string;
	private logger: Logger;

	constructor (username, password, logger) {
		this.apiUrl = `${API_URL}/${API_VERSION}`;
		this.userName = username;
		this.password = password;
		this.logger = logger;
	}

	public getUser () {
		// currently not in use, maybe in the future it will be.
		return fetch(`${this.apiUrl}/user`, {
			method: 'get',
			headers: new Headers({
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`)
			})
		}).then((response) => response.json());
	}

	public getTeams (role: string) {
		let teams: Array<string> = [];
		const endpoint = `${this.apiUrl}/workspaces?role=${role}&pagelen=100`;
		this.logger.debug(`[bitbucket] getting teams for ${this.userName}, url: ${endpoint}, role: ${role}`);

		const callApi = (url) => {
			return new Promise<{role: string; teams: Array<string>}>((resolve) => {
				fetch(url, {
					method: 'get',
					headers: new Headers({
						'Accept': 'application/json',
						'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`)
					})
				})
				.then((response) => response.json())
				.then((response: any) => {
					// this.logger.debug("getTeams: " + JSON.stringify(response, null, 2));
					const teamValues: Array<string> = response?.values?.map((x) => x.slug);
					if (teamValues !== undefined && teamValues.length !== 0) {
						teams = [
							...teams,
							...teamValues
						]
					}
					if (response?.next) return callApi(response.next);
					resolve({ role, teams });
				});
			})
		}

		return callApi(`${endpoint}`);
	}

	public getPrivileges () {
		return Promise.all([
			this.getTeams('member'),
			this.getTeams('collaborator'),
			this.getTeams('owner'),
		]).then((values) => {
			let result = {};
			values.forEach(({ role, teams }) => {
				for (const team of teams) {
					result = {
						...result,
						...{ [team]: role }
					};
				}

			});
			return { teams: result };
		});
	}
}
