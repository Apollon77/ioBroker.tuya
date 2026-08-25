const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { expect } = require('chai');

function walk(node, visitor) {
    if (!node || typeof node !== 'object') {
        return;
    }
    visitor(node);
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
            for (const child of value) {
                walk(child, visitor);
            }
        } else if (value && typeof value === 'object') {
            walk(value, visitor);
        }
    }
}

describe('main.js http-mitm-proxy startup handling', () => {
    it('requires http-mitm-proxy without referencing the obsolete CA patch path', () => {
        const mainJs = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
        const ast = acorn.parse(mainJs, { ecmaVersion: 'latest' });
        let requiresHttpMitmProxy = false;
        let requiresHttpMitmProxyInternals = false;

        walk(ast, node => {
            if (
                node.type === 'CallExpression' &&
                node.callee &&
                node.callee.type === 'Identifier' &&
                node.callee.name === 'require' &&
                node.arguments &&
                node.arguments[0] &&
                node.arguments[0].type === 'Literal'
            ) {
                if (node.arguments[0].value === 'http-mitm-proxy') {
                    requiresHttpMitmProxy = true;
                } else if (typeof node.arguments[0].value === 'string' && node.arguments[0].value.startsWith('http-mitm-proxy/')) {
                    requiresHttpMitmProxyInternals = true;
                }
            }
        });

        expect(requiresHttpMitmProxy).to.be.true;
        expect(requiresHttpMitmProxyInternals).to.be.false;
    });
});
