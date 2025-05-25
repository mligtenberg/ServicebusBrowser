export type PropertyValue = number | boolean | string | Date | null;

/**
 * Describes the message to be sent to Service Bus.
 */
export interface ServiceBusMessage {
  /**
   * The message body that needs to be sent or is received.
   * If the application receiving the message is not using this SDK,
   * convert your body payload to a byte array or Buffer for better
   * cross-language compatibility.
   */
  body: any;
  /**
   * The message identifier is an
   * application-defined value that uniquely identifies the message and its payload.
   *
   * Note: Numbers that are not whole integers are not allowed.
   */
  messageId?: string | number;
  /**
   * The content type of the message. Optionally describes
   * the payload of the message, with a descriptor following the format of RFC2045, Section 5, for
   * example "application/json".
   */
  contentType?: string;
  /**
   * The correlation identifier that allows an
   * application to specify a context for the message for the purposes of correlation, for example
   * reflecting the MessageId of a message that is being replied to.
   * See {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-messages-payloads?#message-routing-and-correlation | Message Routing and Correlation}.
   */
  correlationId?: string | number;
  /**
   * The partition key for sending a message to a partitioned entity.
   * Maximum length is 128 characters. For {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-partitioning | partitioned entities},
   * setting this value enables assigning related messages to the same internal partition,
   * so that submission sequence order is correctly recorded. The partition is chosen by a hash
   * function over this value and cannot be chosen directly.
   * - For session-aware entities, the `sessionId` property overrides this value.
   * - For non partitioned entities, partition key will be ignored
   *
   */
  partitionKey?: string;
  /**
   * The partition key for sending a message into an entity
   * via a partitioned transfer queue. Maximum length is 128 characters. If a message is sent via a
   * transfer queue in the scope of a transaction, this value selects the transfer queue partition:
   * This is functionally equivalent to `partitionKey` property and ensures that messages are kept
   * together and in order as they are transferred.
   * See {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-transactions#transfers-and-send-via | Transfers and Send Via}.
   */
  /**
   * The session identifier for a session-aware entity. Maximum
   * length is 128 characters. For session-aware entities, this application-defined value specifies
   * the session affiliation of the message. Messages with the same session identifier are subject
   * to summary locking and enable exact in-order processing and demultiplexing. For
   * session-unaware entities, this value is ignored.
   * {@link https://docs.microsoft.com/azure/service-bus-messaging/message-sessions | Message Sessions}.
   */
  sessionId?: string;
  /**
   * The session identifier augmenting the `replyTo` address.
   * Maximum length is 128 characters. This value augments the ReplyTo information and specifies
   * which SessionId should be set for the reply when sent to the reply entity.
   * See {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-messages-payloads?#message-routing-and-correlation | Message Routing and Correlation}.
   */
  replyToSessionId?: string;
  /**
   * The message’s time to live value. This value is the relative
   * duration after which the message expires, starting from the instant the message has been
   * accepted and stored by the broker, as captured in `enqueuedTimeUtc`. When not set explicitly,
   * the assumed value is the DefaultTimeToLive for the respective queue or topic. A message-level
   * `timeToLive` value cannot be longer than the entity's DefaultTimeToLive setting and it is
   * silently adjusted if it does. See
   * {@link https://docs.microsoft.com/azure/service-bus-messaging/message-expiration | Expiration}.
   */
  timeToLive?: string;
  /**
   * The application specific label. This property enables the
   * application to indicate the purpose of the message to the receiver in a standardized. fashion,
   * similar to an email subject line. The mapped AMQP property is "subject".
   */
  subject?: string;
  /**
   * The "to" address. This property is reserved for future use in routing
   * scenarios and presently ignored by the broker itself. Applications can use this value in
   * rule-driven {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-auto-forwarding | auto-forward chaining}
   * scenarios to indicate the intended logical destination of the message.
   */
  to?: string;
  /**
   * The address of an entity to send replies to. This optional and
   * application-defined value is a standard way to express a reply path to the receiver of the
   * message. When a sender expects a reply, it sets the value to the absolute or relative path of
   * the queue or topic it expects the reply to be sent to. See
   * {@link https://docs.microsoft.com/azure/service-bus-messaging/service-bus-messages-payloads?#message-routing-and-correlation | Message Routing and Correlation}.
   */
  replyTo?: string;
  /**
   * The date and time in UTC at which the message will
   * be enqueued. This property returns the time in UTC; when setting the property, the
   * supplied DateTime value must also be in UTC. This value is for delayed message sending.
   * It is utilized to delay messages sending to a specific time in the future. Message enqueuing
   * time does not mean that the message will be sent at the same time. It will get enqueued,
   * but the actual sending time depends on the queue's workload and its state.
   */
  scheduledEnqueueTimeUtc?: Date;
  /**
   * The application specific properties which can be
   * used for custom message metadata.
   */
  applicationProperties?: {
    [key: string]: PropertyValue;
  };
}


/**
 * Describes the message received from Service Bus during peek operations and so cannot be settled.
 */
export declare interface ServiceBusReceivedMessage extends ServiceBusMessage {
  /**
   * The reason for deadlettering the message.
   * @readonly
   */
  readonly deadLetterReason?: string;
  /**
   * The error description for deadlettering the message.
   * @readonly
   */
  readonly deadLetterErrorDescription?: string;
  /**
   * The lock token is a reference to the lock that is being held by the broker in
   * `peekLock` receive mode. Locks are used internally settle messages as explained in the
   * {@link https://docs.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement | product documentation in more detail}
   * - Not applicable when the message is received in `receiveAndDelete` receive mode.
   * mode.
   * @readonly
   */
  readonly lockToken?: string;
  /**
   * Number of deliveries that have been attempted for this message. The count is
   * incremented when a message lock expires, or the message is explicitly abandoned using the
   * `abandon()` method on the message.
   * @readonly
   */
  readonly deliveryCount?: number;
  /**
   * The UTC instant at which the message has been accepted and stored in Service Bus.
   * @readonly
   */
  readonly enqueuedTimeUtc?: Date;
  /**
   * The UTC instant at which the message is marked for removal and no longer available for
   * retrieval from the entity due to expiration. This property is computed from 2 other properties
   * on the message: `enqueuedTimeUtc` + `timeToLive`.
   */
  readonly expiresAtUtc?: Date;
  /**
   * The UTC instant until which the message is held locked in the queue/subscription.
   * When the lock expires, the `deliveryCount` is incremented and the message is again available
   * for retrieval.
   * - Not applicable when the message is received in `receiveAndDelete` receive mode.
   * mode.
   */
  lockedUntilUtc?: Date;
  /**
   * The original sequence number of the message. For
   * messages that have been auto-forwarded, this property reflects the sequence number that had
   * first been assigned to the message at its original point of submission.
   * @readonly
   */
  readonly enqueuedSequenceNumber?: number;
  /**
   * The unique number assigned to a message by Service Bus.
   * The sequence number is a unique 64-bit integer assigned to a message as it is accepted
   * and stored by the broker and functions as its true identifier. For partitioned entities,
   * the topmost 16 bits reflect the partition identifier. Sequence numbers monotonically increase.
   * They roll over to 0 when the 48-64 bit range is exhausted.
   *
   * **Max safe integer** that Javascript currently supports is `2^53 - 1`. The sequence number
   * is an AMQP `Long` type which can be upto 64 bits long. To represent that we are using a
   * library named {@link https://github.com/dcodeIO/long.js | long.js}. We expect customers
   * to use the **`Long`** type exported by this library.
   * @readonly
   */
  readonly sequenceNumber?: string;
  /**
   * The name of the queue or subscription that this message
   * was enqueued on, before it was deadlettered. Only set in messages that have been dead-lettered
   * and subsequently auto-forwarded from the dead-letter sub-queue to another entity. Indicates the
   * entity in which the message was dead-lettered.
   * @readonly
   */
  readonly deadLetterSource?: string;
  /**
   * State of the message can be active, deferred or scheduled. Deferred messages have deferred state,
   * scheduled messages have scheduled state, all other messages have active state.
   */
  readonly state: "active" | "deferred" | "scheduled";
}

export type SystemKeyProperty = Exclude<keyof ServiceBusMessage, 'body' | 'applicationProperties'>;
export const SystemKeyProperties: SystemKeyProperty[] = [
  'correlationId',
  'partitionKey',
  'sessionId',
  'replyToSessionId',
  'messageId',
  'subject',
  'to',
  'replyTo',
  'scheduledEnqueueTimeUtc',
  'timeToLive',
];
