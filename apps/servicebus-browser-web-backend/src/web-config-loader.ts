import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';
import * as fs from 'fs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is UUID {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export interface WorkspaceConfig {
  id: UUID;
  name: string;
  connections: Connection[];
  primaryColor?: string;
}

export interface ParsedConfig {
  workspaces: WorkspaceConfig[];
}

export function loadConfig(configPath: string): ParsedConfig {
  if (!fs.existsSync(configPath)) {
    console.warn(`Config file not found at ${configPath}; starting with empty workspace.`);
    return {
      workspaces: [
        {
          id: crypto.randomUUID() as UUID,
          name: 'Default',
          connections: [],
        },
      ],
    };
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (Array.isArray(raw)) {
    // Legacy flat format: wrap into a single "Default" workspace.
    console.warn(
      `[DEPRECATION] Config file at ${configPath} uses the legacy flat-connections format. ` +
        `Migrate to the versioned workspace format: { "version": 1, "workspaces": [...] }`,
    );
    const connections = raw as Connection[];
    return {
      workspaces: [
        {
          id: crypto.randomUUID() as UUID,
          name: 'Default',
          connections,
        },
      ],
    };
  }

  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`Config file at ${configPath} is not a valid JSON object or array.`);
  }

  if (!('version' in raw)) {
    console.warn(
      `[DEPRECATION] Config file at ${configPath} is missing the "version" field. ` +
        `Treating all connections as a single "Default" workspace. ` +
        `Migrate to: { "version": 1, "workspaces": [...] }`,
    );
    const connections: Connection[] = (raw as { connections?: Connection[] }).connections ?? [];
    return {
      workspaces: [
        {
          id: crypto.randomUUID() as UUID,
          name: 'Default',
          connections,
        },
      ],
    };
  }

  const versioned = raw as { version: unknown; workspaces: unknown };

  if (versioned.version !== 1) {
    throw new Error(
      `Config file at ${configPath} has unsupported version ${versioned.version}. Only version 1 is supported.`,
    );
  }

  if (!Array.isArray(versioned.workspaces)) {
    throw new Error(`Config file at ${configPath}: "workspaces" must be an array.`);
  }

  const workspaceIds = new Set<string>();
  const connectionIds = new Set<string>();
  const workspaces: WorkspaceConfig[] = [];

  for (let i = 0; i < versioned.workspaces.length; i++) {
    const ws = versioned.workspaces[i] as Record<string, unknown>;

    if (!isValidUuid(ws['id'])) {
      throw new Error(
        `Config file at ${configPath}: workspace[${i}] has missing or invalid "id" (must be a UUID).`,
      );
    }
    if (typeof ws['name'] !== 'string' || ws['name'].trim() === '') {
      throw new Error(
        `Config file at ${configPath}: workspace[${i}] has missing or empty "name".`,
      );
    }

    if (workspaceIds.has(ws['id'])) {
      throw new Error(
        `Config file at ${configPath}: duplicate workspace id "${ws['id']}".`,
      );
    }
    workspaceIds.add(ws['id'] as string);

    const rawConnections = ws['connections'];
    if (!Array.isArray(rawConnections)) {
      throw new Error(
        `Config file at ${configPath}: workspace[${i}] "connections" must be an array.`,
      );
    }

    const connections: Connection[] = [];
    for (let j = 0; j < rawConnections.length; j++) {
      const conn = rawConnections[j] as Record<string, unknown>;
      if (!isValidUuid(conn['id'])) {
        throw new Error(
          `Config file at ${configPath}: workspace[${i}].connections[${j}] has missing or invalid "id".`,
        );
      }
      if (connectionIds.has(conn['id'] as string)) {
        throw new Error(
          `Config file at ${configPath}: duplicate connection id "${conn['id']}" (connection ids must be unique across all workspaces).`,
        );
      }
      connectionIds.add(conn['id'] as string);
      connections.push(conn as unknown as Connection);
    }

    if (
      ws['primaryColor'] !== undefined &&
      typeof ws['primaryColor'] !== 'string'
    ) {
      throw new Error(
        `Config file at ${configPath}: workspace[${i}] "primaryColor" must be a string.`,
      );
    }

    const extraKeys = Object.keys(ws).filter(
      (k) => !['id', 'name', 'connections', 'primaryColor'].includes(k),
    );
    if (extraKeys.length > 0) {
      console.warn(
        `Config file at ${configPath}: workspace[${i}] has unknown fields [${extraKeys.join(', ')}] — ignoring.`,
      );
    }

    workspaces.push({
      id: ws['id'] as UUID,
      name: (ws['name'] as string).trim(),
      connections,
      ...(ws['primaryColor'] ? { primaryColor: ws['primaryColor'] as string } : {}),
    });
  }

  return { workspaces };
}
