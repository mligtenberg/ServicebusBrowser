export interface Settings {
  savedConnections: { [key: string]: {
    name: string;
    connectionString: string;
    type: "byConnectionString";
    }
  };
}