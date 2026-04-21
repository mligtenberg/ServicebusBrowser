import * as crypto from 'crypto';
import { EventHubCredential } from './credential-helper';
import { NamedKeyCredential } from '@azure/core-auth';
import { XMLParser } from 'fast-xml-parser';

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
  ).getToken('https://eventhubs.azure.net/');

  if (!token) {
    throw new Error('Failed to acquire access token');
  }

  return `Bearer ${token.token}`;
}

const xmlParser = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false,
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (
    value &&
    typeof value === 'object' &&
    '#text' in value &&
    typeof (value as { '#text'?: unknown })['#text'] === 'string'
  ) {
    return (value as { '#text': string })['#text'].trim();
  }
  return '';
}

interface AtomEntry {
  title?: unknown;
  content?: {
    properties?: {
      PartitionIds?: {
        string?: unknown | unknown[];
      };
      PartitionCount?: unknown;
    };
  };
}

interface AtomDocument {
  feed?: {
    entry?: AtomEntry | AtomEntry[];
  };
  entry?: AtomEntry;
}

function parseXml(xml: string): AtomDocument {
  return xmlParser.parse(xml) as AtomDocument;
}

function parsePartitionIds(entry: AtomEntry): string[] {
  const rawIds = toArray(entry.content?.properties?.PartitionIds?.string);
  return rawIds.map((id) => toText(id)).filter((id) => id.length > 0);
}

function parseEventHubs(xml: string): EventHubInfo[] {
  const document = parseXml(xml);
  const entries = toArray(document.feed?.entry ?? document.entry);

  return entries
    .map((entry) => {
      const name = toText(entry.title);
      if (!name) {
        return null;
      }

      const partitionIds = parsePartitionIds(entry);
      const partitionCountText = toText(
        entry.content?.properties?.PartitionCount,
      );
      const parsedCount = Number.parseInt(partitionCountText, 10);
      const partitionCount = Number.isNaN(parsedCount)
        ? partitionIds.length
        : parsedCount;

      return { name, partitionIds, partitionCount };
    })
    .filter((hub): hub is EventHubInfo => hub !== null);
}

function parseConsumerGroups(xml: string): ConsumerGroupInfo[] {
  const document = parseXml(xml);
  const entries = toArray(document.feed?.entry ?? document.entry);

  return entries
    .map((entry) => ({ name: toText(entry.title) }))
    .filter((group) => group.name.length > 0);
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
