import fs from 'node:fs';
import path from 'node:path';

export type RuntimeStatus = 'implemented' | 'recipe' | 'adapter-required' | 'research-only' | 'unknown';

export type RuntimeEntry = {
  id: string;
  status: RuntimeStatus;
  runtime?: string;
  source?: string;
  composeFrom?: string[];
  adapters?: string[];
  research?: string[];
};

const parseInlineList = (raw: string): string[] => {
  const value = raw.trim();
  if (!value.startsWith('[') || !value.endsWith(']')) return [];
  return value
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
};

const parseScalar = (raw: string): string => raw.trim().replace(/^['"]|['"]$/g, '');

export const loadRuntimeRegistry = (root = process.cwd()): Map<string, RuntimeEntry> => {
  const registryPath = path.join(root, '.motion', 'runtime-registry.yaml');
  const text = fs.readFileSync(registryPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const entries = new Map<string, RuntimeEntry>();
  let insidePrimitives = false;
  let current: RuntimeEntry | null = null;

  for (const line of lines) {
    if (/^primitives:\s*$/.test(line)) {
      insidePrimitives = true;
      current = null;
      continue;
    }
    if (!insidePrimitives) continue;
    if (/^[^\s#][^:]*:\s*$/.test(line)) break;

    const primitiveMatch = line.match(/^  ([A-Za-z0-9_.-]+):\s*$/);
    if (primitiveMatch) {
      current = { id: primitiveMatch[1], status: 'unknown' };
      entries.set(current.id, current);
      continue;
    }
    if (!current) continue;

    const propertyMatch = line.match(/^    ([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    if (!propertyMatch) continue;
    const [, key, raw] = propertyMatch;

    if (key === 'status') current.status = parseScalar(raw) as RuntimeStatus;
    else if (key === 'runtime') current.runtime = parseScalar(raw);
    else if (key === 'source') current.source = parseScalar(raw);
    else if (key === 'compose_from') current.composeFrom = parseInlineList(raw);
    else if (key === 'adapters') current.adapters = parseInlineList(raw);
    else if (key === 'research') current.research = parseInlineList(raw);
  }

  return entries;
};

export const runtimeForPrimitiveIds = (primitiveIds: string[], root = process.cwd()): RuntimeEntry[] => {
  const registry = loadRuntimeRegistry(root);
  return primitiveIds.map((id) => registry.get(id) ?? { id, status: 'unknown' });
};

export const summarizeRuntimeReadiness = (entries: RuntimeEntry[]) => {
  const byStatus: Record<string, number> = {};
  for (const entry of entries) byStatus[entry.status] = (byStatus[entry.status] ?? 0) + 1;
  return {
    byStatus,
    immediatelyExecutable: entries.filter((entry) => entry.status === 'implemented').map((entry) => entry.id),
    recipes: entries.filter((entry) => entry.status === 'recipe').map((entry) => entry.id),
    adapterRequired: entries.filter((entry) => entry.status === 'adapter-required').map((entry) => ({ id: entry.id, adapters: entry.adapters ?? [] })),
    unknown: entries.filter((entry) => entry.status === 'unknown').map((entry) => entry.id),
  };
};
