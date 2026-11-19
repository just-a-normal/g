const key = 'codingvampire.progress.v1';
const themeKey = 'codingvampire.theme';
const layoutKey = 'codingvampire.layout';
const blank = () => Object.create(null);
const codeLimit = 100_000;

export function parseProgress(source, validKeys) {
  const incoming = JSON.parse(source);
  if (incoming?.version !== 1 || !incoming.entries || Array.isArray(incoming.entries) || typeof incoming.entries !== 'object') {
    throw new Error('Choose a CodingVampire progress export (version 1).');
  }

  const entries = blank();
  for (const [id, item] of Object.entries(incoming.entries)) {
    if (!validKeys.has(id)) continue;
    if (!item || typeof item.attempted !== 'boolean' || typeof item.solved !== 'boolean' ||
        !Number.isSafeInteger(item.updatedAt) || item.updatedAt < 0 ||
        (item.code !== undefined && (typeof item.code !== 'string' || item.code.length > codeLimit))) {
      throw new Error('The progress file includes an invalid problem entry.');
    }
    entries[id] = { code: item.code, attempted: item.attempted || item.solved, solved: item.solved, updatedAt: item.updatedAt };
  }
  return entries;
}

function serialize(entries) {
  return JSON.stringify({ version: 1, entries }, null, 2);
}

function merge(existing, incoming) {
  const result = Object.assign(blank(), existing);
  for (const [id, entry] of Object.entries(incoming)) {
    const before = result[id];
    if (!before) {
      result[id] = entry;
      continue;
    }

    result[id] = {
      code: entry.updatedAt >= before.updatedAt ? entry.code : before.code,
      attempted: before.attempted || entry.attempted,
      solved: before.solved || entry.solved,
      updatedAt: Math.max(before.updatedAt, entry.updatedAt)
    };
  }
  return result;
}

export function createProgress(validKeys, notify) {
  function read() {
    const raw = localStorage.getItem(key);
    return raw ? parseProgress(raw, validKeys) : blank();
  }

  let entries;
  try {
    entries = read();
  } catch {
    entries = blank();
    notify('Saved progress could not be loaded. You can still practice and export your current work.');
  }

  function save(changes) {
    entries = merge(entries, changes);
    try {
      entries = merge(read(), entries);
    } catch {
      // A malformed or unavailable store can still be replaced with the current session.
    }
    try {
      localStorage.setItem(key, serialize(entries));
      return true;
    } catch {
      notify('Browser storage is unavailable or full. Export progress to keep your work.');
      return false;
    }
  }

  return {
    get: id => entries[id],
    count: ids => ids.filter(id => entries[id]?.solved).length,
    update(id, changes) {
      if (changes.code?.length > codeLimit) {
        notify('Drafts over 100,000 characters cannot be saved. Shorten this method to save it.');
        return false;
      }
      return save({ [id]: {
        attempted: false, solved: false, ...entries[id], ...changes,
        updatedAt: Math.max(Date.now(), entries[id]?.updatedAt || 0)
      } });
    },
    import(source) {
      const incoming = parseProgress(source, validKeys);
      return save(incoming);
    },
    export() {
      const blob = new Blob([serialize(entries)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'codingvampire-progress.json';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
}

export function getTheme() {
  try {
    const value = localStorage.getItem(themeKey);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // Use the system theme when browser storage is unavailable.
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(themeKey, theme);
  } catch {
    // The selected theme still applies for the current session.
  }
}

export function getClassicLayout() {
  try {
    return localStorage.getItem(layoutKey) !== 'modern';
  } catch {
    return true;
  }
}

export function saveClassicLayout(enabled) {
  try {
    localStorage.setItem(layoutKey, enabled ? 'classic' : 'modern');
  } catch {
    // The selected layout still applies for the current session.
  }
}
