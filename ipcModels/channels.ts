export module serviceBusChannels {
    export const TEST = "servicebus:test";
    export const TEST_RESPONSE = "servicebus:test.response";
    export const GET_QUEUES = "servicebus:getQueues";
    export const GET_QUEUES_RESPONSE = "servicebus:getQueues.response";
}

export module secretsChannels {
    export const GET_SECRETS = "secret:get_all";
    export const GET_SECRETS_RESPONSE = "secret:get_all.reponse";
    export const ADD_SECRET = "secret:add";
    export const ADD_SECRET_REPONSE = "secret:add.reponse";
    export const DELETE_SECRET = "secret:delete";
    export const DELETE_SECRET_RESPONSE = "secret:delete.response";
}