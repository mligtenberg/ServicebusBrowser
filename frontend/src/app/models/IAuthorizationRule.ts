
export declare interface IAuthorizationRule {
    claimType: string;
    accessRights?: ("Manage" | "Send" | "Listen")[];
    keyName: string;
    primaryKey?: string;
    secondaryKey?: string;
}