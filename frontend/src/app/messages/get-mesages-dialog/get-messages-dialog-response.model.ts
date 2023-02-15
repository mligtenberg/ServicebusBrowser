import Long from 'long';

export interface GetMessagesDialogResponseModel {
    amountOfMessagesToRetrieve: number;
    skip?: number;
    fromSequenceNumber?: Long;
}
