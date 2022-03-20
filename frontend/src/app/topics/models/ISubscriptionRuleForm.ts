export interface ISubscriptionRuleForm {
    name: string;
    type: 'sql' | 'correlation';
    sqlFilter: string;
    sqlAction: string;
    correlationFilterContentType: string;
    correlationFilterCorrelationId: string;
    correlationFilterSubject: string;
    correlationFilterMessageId: string;
    correlationFilterReplyTo: string;
    correlationFilterReplyToSessionId: string;
    correlationFilterSessionId: string;
    correlationFilterTo: string;
}
