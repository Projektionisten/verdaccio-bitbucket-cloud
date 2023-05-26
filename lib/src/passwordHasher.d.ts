import { CustomConfig } from '../types';
export declare class Hasher {
    private hashPassword;
    constructor(pluginOptions: CustomConfig);
    hash(password: string): Promise<string>;
    verify(options: {
        password: string;
        hash: string;
    }): Promise<boolean>;
}
