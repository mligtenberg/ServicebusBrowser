import { ISecret } from "..";

export interface ISecretService {
    saveSecret(secret: ISecret): Promise<void>;
    deleteSecret(secretKey: string) : Promise<void>;
    getSecrets(): Promise<ISecret[]>;
}