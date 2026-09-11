import fs from 'node:fs';
import { parse } from '@babel/parser';
const path = 'tests/interface.test.mjs';
const source = fs.readFileSync(path, 'utf8');
const nodes = parse(source, { sourceType: 'module' }).program.body;
const isTest = (n) =>
  n.type === 'ForOfStatement' ||
  (n.type === 'ExpressionStatement' &&
    n.expression.type === 'CallExpression' &&
    n.expression.callee.name === 'test');
const helpers = nodes
  .filter((n) => !isTest(n))
  .map((n) => source.slice(n.start, n.end))
  .join('\n');
fs.mkdirSync('tests/interface-cases', { recursive: true });
for (const f of fs.readdirSync('tests/interface-cases'))
  if (f.endsWith('.test.mjs')) fs.unlinkSync('tests/interface-cases/' + f);
for (const [i, node] of nodes.filter(isTest).entries())
  fs.writeFileSync(
    `tests/interface-cases/${String(i + 1).padStart(2, '0')}.test.mjs`,
    (helpers + '\n' + source.slice(node.start, node.end)).replaceAll(
      "'./fixtures/",
      "'../fixtures/",
    ),
  );
// Each case gets an isolated React/JSDOM realm and releases its scheduler at exit.
fs.renameSync(path, 'tests/interface.reference.mjs');
