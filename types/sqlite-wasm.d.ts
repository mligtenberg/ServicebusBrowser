import '@sqlite.org/sqlite-wasm';
import { Database } from '@sqlite.org/sqlite-wasm';

export {};

type DbId = string | undefined;
type TODO = unknown;

declare module '@sqlite.org/sqlite-wasm' {
  type Sqlite3Version = {
    libVersion: string;
    sourceId: string;
    libVersionNumber: number;
    downloadVersion: number;
  };

  type PromiserResponseSuccess<T extends keyof PromiserMethods> = {
    /** Type of the inbound message */
    type: T;
    /** Operation dependent result */
    result: PromiserMethods[T]['result'];
    /** Same value, if any, provided by the inbound message */
    messageId: string;
    /**
     * The id of the db which was operated on, if any, as returned by the
     * corresponding 'open' operation.
     */
    dbId: DbId;
    // possibly other metadata ...
    /*
  WorkerReceivedTime: number
  WorkerRespondTime: number
  departureTime: number
   */
  };

  type PromiserResponseError = {
    type: 'error';
    /** Operation independent object */
    result: {
      /** Type of the triggereing operation */
      operation: string;
      /** Error Message */
      message: string;
      /** The ErrorClass.name property from the thrown exception */
      errorClass: string;
      /** The message object which triggered the error */
      input: object;
      /** _if available_ a stack trace array */
      stack: TODO[];
    };
    /** Same value, if any, provided by the inbound message */
    messageId: string;
    dbId: DbId;
  };
  type PromiserResponse<T extends keyof PromiserMethods> =
    | PromiserResponseSuccess<T>
    | PromiserResponseError;

  type PromiserMethods = {
    /** @link https://sqlite.org/wasm/doc/trunk/api-worker1.md#method-open */
    open: {
      args: Partial<
        {
          /**
           * The db filename. [=":memory:" or "" (unspecified)]: TODO: See the
           * sqlite3.oo1.DB constructor for peculiarities and transformations
           */
          filename?: string;
        } & {
          /**
           * Sqlite3_vfs name. Ignored if filename is ":memory:" or "". This may
           * change how the given filename is resolved. The VFS may optionally
           * be provided via a URL-style filename argument: filename:
           * "file:foo.db?vfs=...". By default it uses a transient database,
           * created anew on each request.
           *
           * If both this argument and a URI-style argument are provided, which
           * one has precedence is unspecified.
           */
          vfs?: string;
        }
      >;
      result: Database
      /** @link https://sqlite.org/wasm/doc/trunk/api-worker1.md#method-close */
    };
    close: {
      args: { dbId?: DbId };
      result: {
        /** Filename of closed db, or undefined if no db was closed */
        filename: string | undefined;
      };
      /** @link https://sqlite.org/wasm/doc/trunk/api-worker1.md#method-config-get */
    };
    'config-get': {
      args: unknown;
      result: {
        version: Sqlite3Version;
        /** Indicates if BigInt support is enabled */
        bigIntEnabled: boolean;
        /** Result of sqlite3.capi.sqlite3_js_vfs_list() */
        vfsList: string[]; // is there a full list somewhere I can use?
      };
    };
    /**
     * Interface for running arbitrary SQL. Wraps`oo1.DB.exec()` methods. And
     * supports most of its features as defined in
     * https://sqlite.org/wasm/doc/trunk/api-oo1.md#db-exec. There are a few
     * limitations imposed by the state having to cross thread boundaries.
     *
     * @link https://sqlite.org/wasm/doc/trunk/api-worker1.md#method-exec
     */
    exec: {
      args: {
        sql: string;
        dbId?: DbId;
        /**
         * At the end of the result set, the same event is fired with
         * (row=undefined, rowNumber=null) to indicate that the end of the
         * result set has been reached. Note that the rows arrive via
         * worker-posted messages, with all the implications of that.
         */
        callback?: (result: {
          /**
           * Internally-synthesized message type string used temporarily for
           * worker message dispatching.
           */
          type: string;
          /** Sqlilte3 VALUE */
          row: TODO;
          /** 1-based index */
          rowNumber: number;
          columnNames: string[];
        }) => void;
        /**
         * A single value valid as an argument for Stmt.bind(). This is only
         * applied to the first non-empty statement in the SQL which has any
         * bindable parameters. (Empty statements are skipped entirely.)
         */
        bind?: Exclude<TODO, null>;
        [key: string]: TODO; //
      };
      result: { [key: string]: TODO };
    };
  };

  type Promiser = {
    <T extends keyof PromiserMethods>(
      /** The type of the message */
      messageType: T,
      /** The arguments for the message type */
      messageArguments: PromiserMethods[T]['args'],
    ): Promise<PromiserResponse<T>>;

    <T extends keyof PromiserMethods>(message: {
      /** The type of the message */
      type: T;
      /** The arguments for the message type */
      args: PromiserMethods[T]['args'];
    }): Promise<PromiserResponse<T>>;
  };

  function sqlite3Worker1Promiser(): Promise<Promiser>;
}
