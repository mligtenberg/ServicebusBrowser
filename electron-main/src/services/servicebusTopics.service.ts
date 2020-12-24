import { TopicRuntimeProperties } from "@azure/service-bus";
import { IConnection, ITopic } from "../../../ipcModels";
import { getAdminClient } from "./servicebusConnections.service";

export async function getTopics(connection: IConnection): Promise<ITopic[]> {
    const client = getAdminClient(connection);
  
    let finished = false;
    const topics: TopicRuntimeProperties[] = [];
  
    do {
      const result = await client.listTopicsRuntimeProperties().next();
      topics.push(result.value);
      finished = result.done ?? false;
    } while (finished);
  
    return topics.map(q => {
      return {
        name: q.name,
      } as ITopic
    })
  }  