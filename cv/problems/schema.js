export function expression(java, display = java) {
  return { java, display };
}

export function java(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value.java;
  return JSON.stringify(value);
}

export function display(value) {
  if (Array.isArray(value)) return '[' + value.map(display).join(', ') + ']';
  if (value && typeof value === 'object') return value.display;
  return JSON.stringify(value);
}

export const ints = (...values) => expression('new int[]{' + values.join(', ') + '}', display(values));
export const matrix = (...rows) => expression(
  'new int[][]{' + rows.map(row => '{' + row.join(', ') + '}').join(', ') + '}', display(rows)
);
export const list = (...values) => expression(
  'new ArrayList<>(Arrays.asList(' + values.map(java).join(', ') + '))', display(values)
);

export function problem(signature, description, hint, body, cases, options = {}) {
  const name = signature.match(/(\w+)\(/)[1];
  return {
    id: name, name, description, hint,
    starter: 'public ' + signature + ' {\n    \n}',
    solution: 'public ' + signature + ' {\n' + body.split('\n').map(line => '    ' + line).join('\n') + '\n}',
    tests: cases.map(([args, expected], index) => ({
      call: name + '(' + args.map(display).join(', ') + ')',
      invoke: 'new Solution().' + name + '(' + args.map(java).join(', ') + ')',
      expected: java(expected), expectedDisplay: display(expected), hidden: index >= 3
    })),
    ...options
  };
}

export function topic(id, name, description, difficulty, problems) {
  return { id, name, description, difficulty, problems };
}
