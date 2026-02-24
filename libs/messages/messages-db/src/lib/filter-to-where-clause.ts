import {
  MessageFilter,
  PropertyFilter,
} from '@service-bus-browser/messages-contracts';

export type WhereClause = {
  clause: string;
  args: Array<string | number | boolean | null>;
};

const SYSTEM_PROPERTY_COLUMN_MAP: Record<string, string> = {
  state: 'messageState',
  to: 'messageTo',
};

export function combineWhereClauses(clauses: WhereClause[]): WhereClause {
  clauses = clauses.filter((clause) => clause.clause.trim() !== '');

  if (!clauses.length) {
    return { clause: '', args: [] };
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return {
    clause: "WHERE " + clauses.map((clause) => "(" + clause.clause.replace("WHERE ", "") + ")").join(' AND '),
    args: clauses.flatMap((clause) => clause.args),
  };
}

export function selectionToWhereClause(selection?: string[]): WhereClause {
  if (!selection || !selection.length) {
    return { clause: '', args: [] };
  }

  return {
    clause: `WHERE messages.id IN (${selection.map(() => '?').join(', ')})`,
    args: selection,
  };
}

export function filterToWhereClause(filter?: MessageFilter): WhereClause {
  if (!filter) {
    return { clause: '', args: [] };
  }

  const clauses: string[] = [];
  const args: Array<string | number | boolean | null> = [];

  for (const bodyFilter of filter.body) {
    if (!bodyFilter.isActive) {
      continue;
    }

    switch (bodyFilter.filterType) {
      case 'contains':
        clauses.push('messages.body LIKE ?');
        args.push(`%${bodyFilter.value}%`);
        break;
      case 'equals':
        clauses.push('messages.body = ?');
        args.push(bodyFilter.value);
        break;
      case 'notcontains':
        clauses.push('messages.body NOT LIKE ?');
        args.push(`%${bodyFilter.value}%`);
        break;
      case 'notequals':
        clauses.push('messages.body != ?');
        args.push(bodyFilter.value);
        break;
      case 'regex':
        clauses.push('regexp(?, messages.body)');
        args.push(bodyFilter.value);
        break;
      case 'notregex':
        clauses.push('NOT regexp(?, messages.body)');
        args.push(bodyFilter.value);
        break;
      default:
        break;
    }
  }

  for (const systemPropertyFilter of filter.systemProperties) {
    appendPropertyClause(
      clauses,
      args,
      systemPropertyFilter,
      resolveSystemPropertyColumn(systemPropertyFilter.fieldName),
    );
  }

  for (const applicationPropertyFilter of filter.applicationProperties) {
    if (!applicationPropertyFilter.isActive) {
      continue;
    }

    const appClauses: string[] = [
      'messageId = messages.id',
      'propertyName = ?',
    ];
    const appArgs: Array<string | number | boolean | null> = [
      applicationPropertyFilter.fieldName,
    ];

    appendPropertyClause(
      appClauses,
      appArgs,
      applicationPropertyFilter,
      'propertyValue',
    );

    clauses.push(
      `EXISTS (SELECT 1 FROM applicationProperties WHERE ${appClauses.join(' AND ')})`,
    );
    args.push(...appArgs);
  }

  if (!clauses.length) {
    return { clause: '', args: [] };
  }

  return {
    clause: `WHERE ${clauses.join(' AND ')}`,
    args,
  };
}

function appendPropertyClause(
  clauses: string[],
  args: Array<string | number | boolean | null>,
  filter: PropertyFilter,
  columnName: string,
) {
  if (!filter.isActive) {
    return;
  }

  if (filter.fieldType === 'string') {
    switch (filter.filterType) {
      case 'contains':
        clauses.push(`${columnName} LIKE ?`);
        args.push(`%${filter.value}%`);
        return;
      case 'equals':
        clauses.push(`${columnName} = ?`);
        args.push(filter.value);
        return;
      case 'notcontains':
        clauses.push(`${columnName} NOT LIKE ?`);
        args.push(`%${filter.value}%`);
        return;
      case 'notequals':
        clauses.push(`${columnName} != ?`);
        args.push(filter.value);
        return;
      case 'regex':
        clauses.push(`regexp(?, ${columnName})`);
        args.push(filter.value);
        return;
      case 'notregex':
        clauses.push(`NOT regexp(?, ${columnName})`);
        args.push(filter.value);
        return;
      default:
        return;
    }
  }

  if (filter.fieldType === 'number') {
    switch (filter.filterType) {
      case 'greater':
        clauses.push(`CAST(${columnName} AS REAL) > ?`);
        args.push(filter.value);
        return;
      case 'less':
        clauses.push(`CAST(${columnName} AS REAL) < ?`);
        args.push(filter.value);
        return;
      case 'equals':
        clauses.push(`CAST(${columnName} AS REAL) = ?`);
        args.push(filter.value);
        return;
      case 'notequals':
        clauses.push(`CAST(${columnName} AS REAL) != ?`);
        args.push(filter.value);
        return;
      default:
        return;
    }
  }

  if (filter.fieldType === 'date') {
    const value = filter.value.toISOString();
    switch (filter.filterType) {
      case 'before':
        clauses.push(`${columnName} < ?`);
        args.push(value);
        return;
      case 'after':
        clauses.push(`${columnName} > ?`);
        args.push(value);
        return;
      case 'equals':
        clauses.push(`${columnName} = ?`);
        args.push(value);
        return;
      case 'notequals':
        clauses.push(`${columnName} != ?`);
        args.push(value);
        return;
      default:
        return;
    }
  }

  if (filter.fieldType === 'boolean') {
    clauses.push(`${columnName} = ?`);
    args.push(filter.value);
    return;
  }

  if (filter.fieldType === 'timespan') {
    switch (filter.filterType) {
      case 'greater':
        clauses.push(`${columnName} > ?`);
        args.push(filter.value);
        return;
      case 'less':
        clauses.push(`${columnName} < ?`);
        args.push(filter.value);
        return;
      case 'equals':
        clauses.push(`${columnName} = ?`);
        args.push(filter.value);
        return;
      case 'notequals':
        clauses.push(`${columnName} != ?`);
        args.push(filter.value);
        return;
      default:
        return;
    }
  }
}

function resolveSystemPropertyColumn(fieldName: string): string {
  return SYSTEM_PROPERTY_COLUMN_MAP[fieldName] ?? fieldName;
}

export function getWhereClause(filter?: MessageFilter, selection?: string[]) {
  const filterWhereClause = filterToWhereClause(filter);
  const selectionWhereClause = selectionToWhereClause(selection);
  const combined = combineWhereClauses([filterWhereClause, selectionWhereClause]);

  console.log({
    filterWhereClause,
    selectionWhereClause,
    combined
  });

  return combined;
}
