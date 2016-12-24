"use strict";

const Config = require('./config.json')

class Grid {

    constructor(options) {
        this.options = Object.assign({}, Config, options);
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

    // Given a particular input, predict an output 
    // from available data (randomised, but biased through training) 
    predict(input, expectedOutput) {
        var choices = this.input(input);
        var sum = choices.reduce((acc, weight) => acc + weight, 0);
        var weighted = choices.reduce((arr, weight, index) => {
            for (var i = 0; i < weight; i = i + sum / 100)
                arr.push(index);
            return arr;
        }, []);
        var index = weighted[Math.floor(Math.random() * weighted.length)];
        var output = this.outputs[index];
        if (this.options.adaptive) {
            // Adaptive? Strengthen the link between input and output.
            // The logic here is that neural pathways are strengthened
            // through their use. In other words, we are likely to repeat
            // our previous choices in the absence of anything telling us otherwise.
            // This is what makes fusspot so stubborn. 
            // To turn it off use `{ adaptive: false }` during instantiation
            if (!expectedOutput || output === expectedOutput)
                    this.strengthen(input, output);
        }
        return output;
    }

    strengthen(input, output, weight) {
        return this.link(input, output, 1 + (weight || this.options.learningRate));
    }

    weaken(input, output, weight) {
        return this.link(input, output, 1 - (weight || this.options.learningRate));
    }

    certain(input, output) {
        return this.link(input, output, 100);
    }

    // Link an input and an output so that they 
    // are both recognised as possibilities in its environment.
    // Optional parameter `change` can be used to bias the
    // likelihood of output occuring as a result of the input. 
    link(input, output, change) {
        var index = this.output(output);
        var relationships = this.input(input);
        // Strengthen/weaken link
        if (change) {
            relationships[index] *= change;
            if (relationships[index] > 1) {
                relationships[index] = 1;
            }
        }
        return this;
    }

    reset() {
        // All i/o relationships back to default weight.
        var baseWeight = this.options.baseWeight;
        Object.keys(this.inputs).forEach(input => {
            var relationships = this.inputs[input];
            relationships.forEach((w, i) => relationships[i] = baseWeight);
        });
    }

    clear() {
        // Forget everything. Useful for testing.
        this.inputs = {};
        this.outputs = [undefined];
    }
}

function debug() {
    if (Config.debug) {
        console.log.apply(console, arguments);
    }
}

module.exports = {
    Grid: Grid
}
