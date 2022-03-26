import { IFormArray } from '@rxweb/types';

export interface ISubscriptionRuleApplicationPropertiesForm {
    key: string;
    value: string;
}

export interface ISubscriptionRuleForm {
    name: string;
    type: 'sql' | 'correlation';
    sqlFilter?: string;
    sqlAction?: string;
    correlationFilterContentType?: string;
    correlationFilterCorrelationId?: string;
    correlationFilterSubject?: string;
    correlationFilterMessageId?: string;
    correlationFilterReplyTo?: string;
    correlationFilterReplyToSessionId?: string;
    correlationFilterSessionId?: string;
    correlationFilterTo?: string;
    correlationApplicationProperties?: IFormArray<ISubscriptionRuleApplicationPropertiesForm>;
}
