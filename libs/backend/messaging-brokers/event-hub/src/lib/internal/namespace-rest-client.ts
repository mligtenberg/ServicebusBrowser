import * as crypto from 'crypto';
import { EventHubCredential } from './credential-helper';
import { NamedKeyCredential } from '@azure/core-auth';

export interface EventHubInfo {
  name: string;
  partitionIds: string[];
  partitionCount: number;
}

export interface ConsumerGroupInfo {
  name: string;
}

function isSasCredential(
  credential: EventHubCredential['credential'],
): credential is NamedKeyCredential {
  return 'name' in credential && 'key' in credential;
}

function generateSasToken(
  resourceUri: string,
  keyName: string,
  key: string,
): string {
  const encoded = encodeURIComponent(resourceUri.toLowerCase());
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const stringToSign = `${encoded}\n${expiry}`;
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(stringToSign);
  const signature = encodeURIComponent(hmac.digest('base64'));
  return `SharedAccessSignature sr=${encoded}&sig=${signature}&se=${expiry}&skn=${keyName}`;
}

async function getAuthHeader(
  ehCredential: EventHubCredential,
  resourceUri: string,
): Promise<string> {
  const { credential, sharedAccessKeyName, sharedAccessKey } = ehCredential;

  if (isSasCredential(credential) && sharedAccessKeyName && sharedAccessKey) {
    return generateSasToken(resourceUri, sharedAccessKeyName, sharedAccessKey);
  }

  const token = await (
    credential as { getToken(scope: string): Promise<{ token: string } | null> }
  ).getToken('https://servicebus.azure.net/.default');

  if (!token) {
    throw new Error('Failed to acquire access token');
  }

  return `Bearer ${token.token}`;
}

function parseAtomTitles(xml: string): string[] {
  const titles: string[] = [];
  const titleRegex = /<title[^>]*type="text"[^>]*>([^<]+)<\/title>/gi;
  let match: RegExpExecArray | null;
  while ((match = titleRegex.exec(xml)) !== null) {
    const title = match[1].trim();
    // Skip the feed-level title (first one is usually "Event Hubs" or similar)
    if (title && !title.startsWith('Event Hub')) {
      titles.push(title);
    }
  }
  return titles;
}

function parsePartitionIds(xml: string): string[] {
  const ids: string[] = [];
  const sectionMatch = /<PartitionIds[^>]*>([\s\S]*?)<\/PartitionIds>/i.exec(
    xml,
  );
  if (!sectionMatch) return ids;
  const stringRegex = /<[^:>]*:string>([^<]+)<\/[^:>]*:string>/gi;
  let match: RegExpExecArray | null;
  while ((match = stringRegex.exec(sectionMatch[1])) !== null) {
    ids.push(match[1].trim());
  }
  return ids;
}

function parseEventHubs(xml: string): EventHubInfo[] {
  const hubs: EventHubInfo[] = [];
  const entryRegex = /<entry.*>([\s\S]*?)<\/entry>/gi;
  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(entry);
    if (!titleMatch) continue;
    const name = titleMatch[1].trim();
    const partitionIds = parsePartitionIds(entry);
    const countMatch = /<PartitionCount>(\d+)<\/PartitionCount>/i.exec(entry);
    const partitionCount = countMatch
      ? parseInt(countMatch[1], 10)
      : partitionIds.length;
    hubs.push({ name, partitionIds, partitionCount });
  }
  return hubs;
}

function parseConsumerGroups(xml: string): ConsumerGroupInfo[] {
  const groups: ConsumerGroupInfo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(entry);
    if (!titleMatch) continue;
    const name = titleMatch[1].trim();
    groups.push({ name });
  }
  return groups;
}

export async function listEventHubs(
  ehCredential: EventHubCredential,
): Promise<EventHubInfo[]> {
  const resourceUri = `https://${ehCredential.hostName}`;
  const url = `${resourceUri}/$Resources/EventHubs?api-version=2017-04&$top=100`;
  const authHeader = await getAuthHeader(ehCredential, resourceUri);

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/atom+xml',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list event hubs: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();
  return parseEventHubs(xml);
}

export async function listConsumerGroups(
  ehCredential: EventHubCredential,
  eventHubName: string,
): Promise<ConsumerGroupInfo[]> {
  const resourceUri = `https://${ehCredential.hostName}`;
  const url = `${resourceUri}/${eventHubName}/ConsumerGroups?api-version=2017-04&$top=100`;
  const authHeader = await getAuthHeader(ehCredential, resourceUri);

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/atom+xml',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list consumer groups: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();
  return parseConsumerGroups(xml);
}

export async function getEventHubInfo(
  ehCredential: EventHubCredential,
  eventHubName: string,
): Promise<EventHubInfo> {
  const resourceUri = `https://${ehCredential.hostName}`;
  const url = `${resourceUri}/${eventHubName}?api-version=2017-04`;
  const authHeader = await getAuthHeader(ehCredential, resourceUri);

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/atom+xml',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get event hub info: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();
  const hubs = parseEventHubs(xml);
  if (hubs.length === 0) {
    throw new Error(`Event hub '${eventHubName}' not found`);
  }
  return hubs[0];
}
