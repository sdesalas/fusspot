
const DEFAULT_SIZE = 256;
const SYNAPSE_PER_NEURON = 2;

class NeuralNetwork {

    constructor(size) {
        this.nodes = [];
        if (size instanceof Array) {
            // Initialize with an array
            // ie new NeuralNetwork([
            //   [{t: 1, w: 0.41}], 
            //   [{t: 2, w: 0.020}, {t: 3, w: 0.135}]
            //   [{t: 5, w: 0.241}], 
            //   [{t: 1, w: 0.02}], 
            //   [{t: 7, w: 0.92}, {t: 2, w: 0.41}]
            //   [{t: 2, w: 0.41}], 
            // ])
            //
            this.nodes = size.map(connections => new Neuron(...connections));
        } else {
            // Initialize with size
            // ie new NeuralNetwork(300)
            if (typeof size !== 'number' || size < 1) {
                size = DEFAULT_SIZE;
            }
            this.nodes = new Array(size)
                .fill()
                .map((n, i) => Neuron.random(size, i));
            // Add ref pointers to corresponding target neurons
            this.nodes.forEach(neuron => neuron.forEach(synapse => {
                synapse.t = this.nodes[synapse.i];
            }));
        }
    }

    get size() {
        return this.nodes.length;
    }

}

// Defines an array of connections to other neurons
class Neuron extends Array {

    // Generates a random neuron
    static random(networkSize, position) {
        // Number of synapses are random based on average
        var synapses = new Array(Random.integer(1, SYNAPSE_PER_NEURON * 2 - 1))
            .fill()
            .map(() => this.synapse(networkSize, position));
        var neuron = new Neuron(...synapses.filter(s => !!s));
        neuron.id = position;
        return neuron;
    }

    static synapse(networkSize, position) {
        var i, w = Math.random();
        /* 
        // Use a tube-shaped network
        // (neurons linked to neurons with similar id)
        var range = Math.ceil(networkSize / 10);
        var offset = position + Math.floor(range / 2);
        for (var tries = 0; tries < 3; tries++) {
            var from = -1 * range + offset;
            var to = range + offset;
            i = Random.integer(from, to);
            if (i > 0 && i < networkSize && i !== position) {
                return { i, w }; // index, weight
            }
        }
        */
        i = Random.integer(0, networkSize);
        if (i !== position) {
            return { i, w };
        }
        return null;
    }

    fire() {
        console.log('Firing ' + this.id);
        this.forEach(synapse => {
            if (synapse.t && synapse.w > 0.2 && !(synapse.l > new Date().getTime() - 1000)) {
                // Stronger connections will fire quicker
                // Weaker connections will not even fire
                setTimeout(() => synapse.t.fire(), Math.round(200 * (1 - synapse.w)));
                // Avoid spasm by tracking when last fired
                synapse.l = new Date().getTime(); 
            }
        });
    }

}

class Random {

    // Inclusive random integers
    static integer(from, to) { 
        if (!from && !to) return 0;
        if (!to) { to = from; from = 0; }
        var diff = to + 1 - from;
        return Math.floor(Math.random() * diff) + from; 
    }
}