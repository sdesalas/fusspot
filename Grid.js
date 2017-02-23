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

    // Link an input and an output so that they 
    // are both recognised as possibilities in its environment.
    // Optional `config` object can contain either:
    // - `value`: absolute value to set the input/output combination to.
    // - `change`: percentage to bias the likelihood of this input/output combination.
    link(input, output, config) {
        var index = this.output(output);
        var relationships = this.input(input);
        if (config) {
            if (!isNaN(config.value)) {
                // Set to specific value
                relationships[index] = config.value;
            } else if (!isNaN(config.change)) {
                // Strengthen/weaken link
                relationships[index] *= config.change;
                if (relationships[index] > 1) {
                    // When above max divide everything by 10
                    for (var i = 0; i < relationships.length; i++) {
                        relationships[i] /= 10;
                    }
                }
            }
        }
        return this;
    }

    strengthen(input, output, change) {
        return this.link(input, output, { change: 1 + (change || this.options.learningRate) });
    }

    weaken(input, output, change) {
        return this.link(input, output, { change: 1 - (change || this.options.learningRate) });
    }

    certain(input, output) {
        var sum = this.input(input).reduce((a,b) => a+b, 0);
        return this.link(input, output, { value: sum * 20 });
    }
 
    likely(input, output) {
        var sum = this.input(input).reduce((a,b) => a+b, 0);
        return this.link(input, output, { value: sum * 3 });
    }

    unlikely(input, output) {
        var sum = this.input(input).reduce((a,b) => a+b, 0);
        return this.link(input, output, { value: sum * 0.33 });
    }

    impossible(input, output) {
        var sum = this.input(input).reduce((a,b) => a+b, 0);
        return this.link(input, output, { value: sum * 0.05 });
    }

    reset(input) {
        // Reset input/output combinations back to default weight.
        var baseWeight = this.options.baseWeight;
        Object.keys(this.inputs).forEach(key => {
            if (input && input !== key) return;
            var relationships = this.inputs[key];
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

if (module && module.exports) {
    module.exports = Grid;
}