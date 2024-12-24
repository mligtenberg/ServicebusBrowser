# clients

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test clients` to execute the unit tests via [Jest](https://jestjs.io).


## library structure
```mermaid
graph TD;
  cm[Connection Manager]
  cc[Connection Client]
  ac[Administration Client]
  mc[Message Client]
  
  cm --getConnection--> cc
  cc --getMessageClient--> mc
  cc --getAdministrationClient --> ac
```
