export declare class Bitbucket {
    private apiUrl;
    private userName;
    private password;
    private logger;
    constructor(username: any, password: any, logger: any);
    getUser(): Promise<unknown>;
    getTeams(role: string): Promise<{
        role: string;
        teams: Array<string>;
    }>;
    getPrivileges(): Promise<{
        teams: {};
    }>;
}
