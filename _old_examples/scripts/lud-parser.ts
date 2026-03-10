/**
 * Ludii .lud ↔ JSON AST parser/serializer.
 *
 * Ludii S-expressions use:
 *   ( ) for lists
 *   { } for arrays (not maps like EDN)
 *   // for line comments
 *   "strings", integers, floats, True/False, bare symbols
 *   #1 #2 etc for macro params
 *   <Tag> for option placeholders
 *
 * JSON AST uses the edn-data shape:
 *   { list: [...] }  for ( )
 *   [...] for { }
 *   { sym: "name" }  for bare symbols
 *   { param: 1 }     for #1
 *   { option: "Tag" } for <Tag>
 *   strings, numbers, booleans as-is
 */

export type LudAtom =
  | string
  | number
  | boolean
  | { sym: string }
  | { param: number }
  | { option: string };

export type LudNode = LudAtom | LudList | LudNode[];
export interface LudList {
  list: LudNode[];
}

// --- Parser ---

export function parseLud(input: string): LudNode[] {
  let pos = 0;

  function skipWhitespaceAndComments() {
    while (pos < input.length) {
      if (/\s/.test(input[pos])) {
        pos++;
      } else if (input[pos] === '/' && input[pos + 1] === '/') {
        while (pos < input.length && input[pos] !== '\n') pos++;
      } else {
        break;
      }
    }
  }

  function parseOne(): LudNode {
    skipWhitespaceAndComments();
    if (pos >= input.length) throw new Error('Unexpected end of input');

    const ch = input[pos];

    if (ch === '(') {
      pos++;
      const items: LudNode[] = [];
      while (true) {
        skipWhitespaceAndComments();
        if (pos >= input.length) throw new Error('Unclosed (');
        if (input[pos] === ')') { pos++; break; }
        items.push(parseOne());
      }
      return { list: items } as LudList;
    }

    if (ch === '{') {
      pos++;
      const items: LudNode[] = [];
      while (true) {
        skipWhitespaceAndComments();
        if (pos >= input.length) throw new Error('Unclosed {');
        if (input[pos] === '}') { pos++; break; }
        items.push(parseOne());
      }
      return items;
    }

    if (ch === '"') {
      pos++;
      let str = '';
      while (pos < input.length && input[pos] !== '"') {
        if (input[pos] === '\\') { pos++; str += input[pos]; }
        else str += input[pos];
        pos++;
      }
      pos++; // closing "
      return str;
    }

    if (ch === '#') {
      pos++;
      let num = '';
      while (pos < input.length && /\d/.test(input[pos])) { num += input[pos]; pos++; }
      return { param: parseInt(num) };
    }

    if (ch === '<') {
      pos++;
      let tag = '';
      while (pos < input.length && input[pos] !== '>') { tag += input[pos]; pos++; }
      pos++; // closing >
      return { option: tag };
    }

    // Number or symbol
    let token = '';
    while (pos < input.length && !/[\s(){}"]/.test(input[pos])) {
      token += input[pos];
      pos++;
    }

    if (token === 'True' || token === 'true') return true;
    if (token === 'False' || token === 'false') return false;

    const asNum = Number(token);
    if (!isNaN(asNum) && token !== '') return asNum;

    return { sym: token };
  }

  const results: LudNode[] = [];
  while (true) {
    skipWhitespaceAndComments();
    if (pos >= input.length) break;
    results.push(parseOne());
  }
  return results;
}

// --- Serializer ---

export function toLud(nodes: LudNode[], indent = 0): string {
  return nodes.map(n => serializeNode(n, indent)).join('\n\n');
}

function serializeNode(node: LudNode, indent: number): string {
  const pad = '    '.repeat(indent);

  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return `"${node}"`;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return node ? 'True' : 'False';

  if (Array.isArray(node)) {
    if (node.length === 0) return '{}';
    const inner = node.map(n => serializeNode(n, indent + 1));
    if (inner.join(' ').length < 60) return `{ ${inner.join(' ')} }`;
    return `{\n${inner.map(i => pad + '    ' + i).join('\n')}\n${pad}}`;
  }

  if ('sym' in node) return (node as { sym: string }).sym;
  if ('param' in node) return `#${(node as { param: number }).param}`;
  if ('option' in node) return `<${(node as { option: string }).option}>`;

  if ('list' in node) {
    const items = (node as LudList).list;
    if (items.length === 0) return '()';
    const inner = items.map(n => serializeNode(n, indent + 1));
    const oneLine = `(${inner.join(' ')})`;
    if (oneLine.length < 80 && !oneLine.includes('\n')) return oneLine;
    return `(${inner[0]}\n${inner.slice(1).map(i => pad + '    ' + i).join('\n')}\n${pad})`;
  }

  return String(node);
}

// --- CLI ---
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (file) {
  const content = readFileSync(file, 'utf-8');
  if (file.endsWith('.lud')) {
    console.log(JSON.stringify(parseLud(content), null, 2));
  } else {
    console.log(toLud(JSON.parse(content) as LudNode[]));
  }
}
