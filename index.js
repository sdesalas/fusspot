"use strict";

const Config = require('./config.json')

class Engine {

    constructor(options) {
        this.options = Object.assign({}, options, Config);
        this.outputs = [undefined];
        this.inputs = [];
    }

    process(input) {
        // Given a particular input, choose an output 
        // at random from available choices (biased by weight) 
        // and then and strengthen the link between input and output.
        // The logic here is that neural pathways are strengthened
        // through their use. 
        // In other words, we are likely to repeat our previous choices
        // in the absence of anything telling us otherwise.
        var totalWeight, choices = [];
        if (this.inputs[input]) {
            totalWeight = this.inputs[input].reduce((total, choice) => total + choice.weight, 0);
            choices = this.inputs[input].reduce((arr, choice) => {
                for(var i = 0; i < choice.weight; i = i + totalWeight / 100)
                    arr.push(choice.target);
                return arr;
            }, []);
        } else {
            // Unknown input, just pick from
            // known outputs with equal likelyhood
            choices = this.outputs.reduce((arr, choice, index) => {
                arr.push(index);
                return arr;
            }, []);
        }
        var target = choices[Math.floor(Math.random() * choices.length)];
        var output = this.outputs[target];
        this.strengthen(input, output);
        return output;
    }

    strengthen(input, output, weight) {
        return this.relate(input, output, 1 + this.options.learningRate);
    }

    weaken(input, output) {
        return this.relate(input, output, 1 - this.options.learningRate);
    }

    relate(input, output, percentage) {
        var target = this.outputs.indexOf(output);
        if (target === -1) {
            target = this.outputs.push(output) - 1;
        }
        var choices = this.inputs[input] = this.inputs[input] || [{
            target: 0, // undefined (ie, input fails to prompt a reponse)
            weight: this.options.baseWeight
        }];
        var relationship = choices.filter(choice => choice.target === target).pop();
        if (!relationship) {
            relationship = choices[choices.push({
                target: target,
                weight: this.options.baseWeight
            }) - 1];
        }
        // Strengthen/weaken link
        relationship.weight = relationship.weight * (percentage || 1);
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
