const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('main.js http-mitm-proxy startup handling', () => {
    it('does not contain the obsolete runtime CA patch workaround', () => {
        const mainJs = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');

        expect(mainJs).to.not.include("require.resolve('http-mitm-proxy/lib/ca.js')");
        expect(mainJs).to.not.include('Cannot patch http-mitm-proxy/lib/ca.js');
    });
});
