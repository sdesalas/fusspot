"use strict";

const Config = require('./config.json')

class Engine {

    constructor(options) {
        this.options = Object.assign({}, options, Config);
        this.outputs = [undefined]; // undefined = no output from input
        this.inputs = {};
    }

    // Add an input, return relationship to every output
    input(input) {
        return this.inputs[input] = this.inputs[input] ||
            // Not available? map to every output
            this.outputs.map(output => this.options.baseWeight);
    }

    // Add an output, return its location
    output(output) {
        var index = this.outputs.indexOf(output);
        if (index === -1) {
            // Not available? map every input to it
            index = this.outputs.push(output) - 1;
            Object.keys(this.inputs).forEach(input => {
                this.inputs[input][index] = this.options.baseWeight;
            });
        }
        return index;
    }

    process(input) {
        // Given a particular input, choose an output 
        // from available choices (randomised, but biased by weight) 
        // and then and strengthen the link between input and output.
        // The logic here is that neural pathways are strengthened
        // through their use. In other words, we are likely to repeat
        // our previous choices in the absence of anything telling us otherwise.
        var choices = this.input(input);
        var sum = choices.reduce((acc, weight) => acc + weight, 0);
        var weighted = choices.reduce((arr, weight, index) => {
            for (var i = 0; i < weight; i = i + sum / 100)
                arr.push(index);
            return arr;
        }, []);
        var index = weighted[Math.floor(Math.random() * weighted.length)];
        var output = this.outputs[index];
        this.strengthen(input, output);
        return output;
    }

    strengthen(input, output, weight) {
        return this.relate(input, output, 1 + (weight || this.options.learningRate));
    }

    weaken(input, output, weight) {
        return this.relate(input, output, 1 - (weight || this.options.learningRate));
    }

    relate(input, output, change) {
        var index = this.output(output);
        var relationships = this.input(input);
        // Strengthen/weaken link
        if (change) {
            relationships[index] *= change;
            if (relationships[index] > Number.MAX_SAFE_INTEGER) {
                relationships[index] = Number.MAX_SAFE_INTEGER;
            }
        }
        return this;
    }
}

function debug() {
    if (Config.debug) {
        console.log.apply(console, arguments);
    }
}

module.exports = {
    Engine: Engine
}