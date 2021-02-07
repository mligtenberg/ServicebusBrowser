export interface IQueueMessageForm {
    body: string;
    subject: string;
    contentType: string;
    customProperties: IQueueMessageCustomPropertyForm[]
}

export interface IQueueMessageCustomPropertyForm {
    key: string;
    type: "string" | "number" | "boolean" | "date",
    value: string;
}