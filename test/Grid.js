const assert = require('assert-fuzzy');
const Config = require('../config.json');
const Grid = require('../').Grid;

describe('Grid', function() {

    var grid;

    beforeEach(function() {
        grid = new Grid();
    });

    it('is defined', function() {
        assert.equal(typeof grid, 'object');
        assert.equal(typeof grid.strengthen, 'function');
        assert.equal(typeof grid.weaken, 'function');
        assert.equal(typeof grid.process, 'function');
    });

    it('#relate() basic trainer logic', function() {
        var x = grid.relate('abc', '123');
        assert.equal(x, grid);
        assert.equal(grid.outputs.length, 2);
        assert.equal(grid.outputs[0], undefined);
        assert.equal(grid.outputs[1], '123');
        assert.equal(Object.keys(grid.inputs).length, 1);
        assert.deepEqual(grid.inputs['abc'], [Config.baseWeight, Config.baseWeight]);
    });

    it('#process() untrained', function() {
        assert.equal(grid.process(1), undefined);
        assert.equal(grid.process('abc'), undefined);
        assert.equal(grid.process(true), undefined);
        assert.equal(grid.process(null), undefined);
        assert.equal(grid.process(undefined), undefined);
    });

    it('#process() with single known output', function() {
        var outcomes = [], iterations = 1000;
        grid.relate('abc', '123');
        while(iterations-- > 0) {
            outcomes.push(grid.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 500);
        assert.around(outcomes.filter(x => x === undefined).length, 500);
    });

    it('#process() with two (distinct) known outputs', function() {
        var outcomes = [], iterations = 1000;
        grid.relate('abc', '123');
        grid.relate(123, '456');
        while(iterations-- > 0) {
            outcomes.push(grid.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 333);
        assert.around(outcomes.filter(x => x === '456').length, 333);
        assert.around(outcomes.filter(x => x === undefined).length, 333);
    });

    it('#process() with two (equal) known outputs', function() {
        var outcomes = [], iterations = 1000;
        grid.relate('abc', '123');
        grid.relate(123, '123');
        while(iterations-- > 0) {
            outcomes.push(grid.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 500);
        assert.around(outcomes.filter(x => x === undefined).length, 500);
    });

    it('#process() with single strengthened output (no reinforcement)', function() {
        var outcomes = [], iterations = 1000;
        while(iterations-- > 0) {
            grid = new Grid(); // recreate to avoid reinforcement
            grid.strengthen('abc', '123');
            outcomes.push(grid.process('abc'));
        }
        assert.around(outcomes.filter(x => x === '123').length, 600);
        assert.around(outcomes.filter(x => x === undefined).length, 400);
    });

    it('#process() with double strengthened output (no reinforcement)', function() {
        var outcomes = [], iterations = 1000;
        while(iterations-- > 0) {
            grid = new Grid(); // recreate to avoid reinforcement
            grid.strengthen('abc', '123');
            grid.strengthen('abc', '123');
            outcomes.push(grid.process('abc'));
        }
        assert.around(outcomes.filter(x => x === '123').length, 690);
        assert.around(outcomes.filter(x => x === undefined).length, 310);
    });

    it('#process() with triple strengthened output (allow reinforcement)', function() {
        var outcomes = [], iterations = 100;
        grid.strengthen('abc', '123');
        grid.strengthen('abc', '123');
        grid.strengthen('abc', '123');
        while(iterations > 0) {
            // allow reinforcement
            outcomes.push(grid.process('abc'));
            iterations--;
        }
        assert.between(outcomes.filter(x => x === '123').length, 75, 100);
        assert.between(outcomes.filter(x => x === undefined).length, 0, 25);
    });

});