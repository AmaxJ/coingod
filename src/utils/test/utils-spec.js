/* eslint-disable no-undef */

const utils = require('../utils.js');
const expect = require('chai').expect;


describe('utils', () => {
    it('.calculatePercentage() should function correctly', () => {
        expect(utils.calculatePercentage(100, 20)).to.equal('20.0');
        expect(utils.calculatePercentage(100, 33.1)).to.equal('33.1');
        expect(utils.calculatePercentage(100, 200)).to.equal('200.0');
    });

    it('.formatPrice() should format a boolean to a usd price format', () => {
        expect(utils.formatPrice(12.99999)).to.equal('13.00');
        expect(utils.formatPrice(5.3432)).to.equal('5.34');
        expect(utils.formatPrice(12345.2323)).to.equal('12345.23');
    });

    it('.parseMessageForTemplate() should pull the contents of a <tmp> tag', () => {
        expect(utils.parseMessageForTemplate('hello <tmp>world</tmp>'))
            .to.equal('world');
        expect(utils.parseMessageForTemplate('<tmp>Foo</tmp> bar!'))
            .to.equal('Foo');
        expect(utils.parseMessageForTemplate('<lbl>Foo</lbl> bar!'))
            .to.equal(null);
    });

    it('.parseMessageForLabel() should pull the contents between lbl tags', () => {
        expect(utils.parseMessageForLabel('hello <lbl>world</lbl>'))
            .to.equal('world');
        expect(utils.parseMessageForLabel('<lbl>Foo</lbl> bar!'))
            .to.equal('Foo');
        expect(utils.parseMessageForLabel('<tmp>Foo</tmp> bar!'))
            .to.equal(null);
    });

    it('.getTemplatesAtPath() should find the array at given destination', () => {
        const testObj = {
            foo: {
                bar: ['hello', 'world']
            }
        };
        expect(utils.getTemplatesAtPath(testObj, ['foo', 'bar']))
            .to.equal(testObj.foo.bar);
    });

    it('.package24HrData() should package 24 price data into an object', () => {
        const priceData = {
            open: 900,
            last: 1000
        };
        expect(utils.package24HrData(priceData)).to.deep.equal({
            openPrice: '900.00',
            currentPrice: '1000.00',
            difference: 100,
            percentChange: '11.1'
        });
    });
});
