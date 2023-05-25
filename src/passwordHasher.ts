import { randomFillSync } from 'crypto';
import { bcrypt, bcryptVerify } from 'hash-wasm';
import { CustomConfig } from '../types';

export class Hasher {
	private hashPassword: boolean;

	constructor (pluginOptions: CustomConfig) {
		this.hashPassword = pluginOptions.hashPassword;
	}

	public async hash (password: string) {
		if (this.hashPassword) {
			const salt = new Uint8Array(16);
			randomFillSync(salt);

			return bcrypt({
				password,
				salt,
				costFactor: 8
			});
		} else {
			return Promise.resolve(password);
		}
	}

	public async verify (options: {
		password: string;
		hash: string;
	}) {
		if (this.hashPassword) {
			return bcryptVerify(options);
		} else {
			return Promise.resolve(options.password === options.hash);
		}
	}
}
