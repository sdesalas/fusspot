const assert = require('assert-fuzzy');
const Config = require('../config.json');
const Engine = require('../').Engine;

describe('Engine', function() {

    var engine;

    beforeEach(function() {
        engine = new Engine();
    });

    it('is defined', function() {
        assert.equal(typeof engine, 'object');
        assert.equal(typeof engine.strengthen, 'function');
        assert.equal(typeof engine.weaken, 'function');
        assert.equal(typeof engine.process, 'function');
    });

    it('#relate() basic trainer logic', function() {
        var x = engine.relate('abc', '123');
        assert.equal(x, engine);
        assert.equal(engine.outputs.length, 2);
        assert.equal(engine.outputs[0], undefined);
        assert.equal(engine.outputs[1], '123');
        assert.equal(Object.keys(engine.inputs).length, 1);
        assert.deepEqual(engine.inputs['abc'], [{ 
            target: 0, 
            weight: Config.baseWeight 
        }, { 
            target: 1, 
            weight: Config.baseWeight 
        }]);
    });

    it('#process() untrained', function() {
        assert.equal(engine.process(1), undefined);
        assert.equal(engine.process('abc'), undefined);
        assert.equal(engine.process(true), undefined);
        assert.equal(engine.process(null), undefined);
        assert.equal(engine.process(undefined), undefined);
    });

    it('#process() with single known output', function() {
        var outcomes = [], iterations = 1000;
        engine.relate('abc', '123');
        while(iterations-- > 0) {
            outcomes.push(engine.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 500);
        assert.around(outcomes.filter(x => x === undefined).length, 500);
    });

    it('#process() with two (distinct) known outputs', function() {
        var outcomes = [], iterations = 1000;
        engine.relate('abc', '123');
        engine.relate(123, '456');
        while(iterations-- > 0) {
            outcomes.push(engine.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 333);
        assert.around(outcomes.filter(x => x === '456').length, 333);
        assert.around(outcomes.filter(x => x === undefined).length, 333);
    });

    it('#process() with two (equal) known outputs', function() {
        var outcomes = [], iterations = 1000;
        engine.relate('abc', '123');
        engine.relate(123, '123');
        while(iterations-- > 0) {
            outcomes.push(engine.process(iterations));
        }
        assert.around(outcomes.filter(x => x === '123').length, 500);
        assert.around(outcomes.filter(x => x === undefined).length, 500);
    });

    it('#process() with single strengthened output (no reinforcement)', function() {
        var outcomes = [], iterations = 1000;
        while(iterations-- > 0) {
            engine = new Engine(); // recreate to avoid reinforcement
            engine.strengthen('abc', '123');
            outcomes.push(engine.process('abc'));
        }
        assert.around(outcomes.filter(x => x === '123').length, 600);
        assert.around(outcomes.filter(x => x === undefined).length, 400);
    });


    it('#process() with double strengthened output (no reinforcement)', function() {
        var outcomes = [], iterations = 1000;
        while(iterations-- > 0) {
            engine = new Engine(); // recreate to avoid reinforcement
            engine.strengthen('abc', '123');
            engine.strengthen('abc', '123');
            outcomes.push(engine.process('abc'));
        }
        assert.around(outcomes.filter(x => x === '123').length, 690);
        assert.around(outcomes.filter(x => x === undefined).length, 310);
    });

    it('#process() with triple strengthened output (allow reinforcement)', function() {
        var outcomes = [], iterations = 1000;
        engine.strengthen('abc', '123');
        engine.strengthen('abc', '123');
        engine.strengthen('abc', '123');
        while(iterations > 0) {
            // allow reinforcement
            outcomes.push(engine.process('abc'));
            iterations--;
        }
        assert.between(outcomes.filter(x => x === '123').length, 900, 1000);
        assert.between(outcomes.filter(x => x === undefined).length, 0, 50);
    });

});