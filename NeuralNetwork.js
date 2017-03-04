"use strict";

const EventEmitter = require('events');

const NETWORK_DEFAULT_SIZE = 256;
const SYNAPSE_AVG_PER_NEURON = 2;
const SIGNAL_MAX_FIRE_DELAY = 300;
const SIGNAL_RECOVERY_DELAY = 1200;
const SIGNAL_FIRE_STRENGTH = 0.33;
const LEARNING_RATE = 0.3;
const LEARNING_PERIOD = 60 * 1000;

class NeuralNetwork extends EventEmitter {

    constructor(size) {
        super();
        this.nodes = [];
        if (typeof size === 'number') {
            // Initialize with size
            // ie new NeuralNetwork(300)
            this.nodes = new Array(size)
                .fill()
                .map((n, i) => Neuron.random(size, i));
        }
        else if (size && size.nodes && size.nodes instanceof Array) {
            // Initialize with exported network
            // ie new NeuralNetwork({ nodes: [
            //   {id: 1, s: [{t: 1, w: 0.41}] }, 
            //   {id: 2, s: [{t: 2, w: 0.020}, {t: 3, w: 0.135}] },
            //   {id: 3, s: [{t: 5, w: 0.241}] }, 
            //   {id: 4, s: [{t: 1, w: 0.02}] }, 
            //   {id: 5, s: [{t: 6, w: 0.92}, {t: 2, w: 0.41}] },
            //   {id: 6, s: [{t: 2, w: 0.41}] }
            // ]})
            //
            this.nodes = size.nodes.map((n, i) => {
                var neuron = new Neuron(n.s, n.id);
                neuron.synapses.forEach(s => s.i = s.t);
                return neuron;
            });
        } 
        // Extra initialization per neuron
        this.nodes.forEach(neuron => {
            // Log fire event
            neuron.on('fire', id => console.log('Firing ' + id));
            // Add synapse ref pointers to corresponding target neurons
            neuron.synapses.forEach(synapse => {
                synapse.t = this.nodes[synapse.i];
            })
        });
    }

    clone() {
        return new NeuralNetwork(this.export());
    }

    export() {
        return { 
            nodes: this.nodes.map(node => Object({ 
                id: node.id, 
                s: node.synapses
                    .slice()
                    // Remove circular ref pointers
                    .map(s => Object({t: s.i, w: s.w})) 
            }))
        }
    }

    unlearn(rate) {
        this.learn(-1 * (rate || LEARNING_RATE));
    }

    learn(rate) {
        var start = new Date().getTime() - LEARNING_PERIOD;
        this.synapses
            .forEach(s => {
                var recency = s.l - start;
                if (recency > 0) {
                    s.w += (recency / LEARNING_PERIOD) * (rate || LEARNING_RATE);
                    s.w = s.w < 0 ? 0 : s.w;
                    s.w = s.w > 1 ? 1 : s.w;
                }
            });
    }

    stop() {
        this.synapses.forEach(s => clearTimeout(s.c));
    }

    get size() {
        return this.nodes.length;
    }

    get strength() {
        var synapses = this.synapses;
        return synapses.map(s => s.w).reduce((a,b) => a+b, 0) / synapses.length;
    }

    get synapses() {
        return this.nodes.reduce((acc, node) => acc.concat(node.synapses), []);
    }
}

class Neuron extends EventEmitter {

    constructor(synapses, index) {
        super();
        this.synapses = synapses || [];
        this.id = index > -1 ? index : Random.alpha(6);
        this.potential = 0; 
    }

    // Generates a random neuron
    static random(networkSize, position) {
        // Number of synapses are random based on average
        var synapses = new Array(Random.integer(1, SYNAPSE_AVG_PER_NEURON * 2 - 1))
            .fill()
            .map(() => {
                var i, w = Math.random();
                
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
                
                // Random network
                // (neurons linked at random)
                i = Random.integer(0, networkSize);
                if (i !== position) {
                    return { i, w };
                }

                // Cannot find suitable target
                return null;
            })
            .filter(s => !!s);
        return new Neuron(synapses, position);
    }

    // Should be optimised as this gets executed very frequently.
    fire(potential) {
        if (this.isfiring) return false;
        // Action potential is accumulated so that
        // certain patterns can trigger even
        // weak synapses.
        this.potential += potential || 1;
        setTimeout(() => this.potential -= potential, SIGNAL_RECOVERY_DELAY / 2);
        if (this.potential > SIGNAL_FIRE_STRENGTH) {
            // Fire signal
            this.isfiring = true;
            this.emit('fire', this.id);
            this.synapses.forEach(synapse => {
                if (synapse.t) {
                    // Stronger connections will fire quicker
                    // @see Conduction Velocity: https://faculty.washington.edu/chudler/cv.html
                    synapse.c = setTimeout(() => {
                        if (synapse.t.fire(synapse.w)) {
                            // Avoid epileptic spasm by tracking when last fired
                            synapse.l = new Date().getTime(); 
                        }
                    }, Math.round(SIGNAL_MAX_FIRE_DELAY * (1 - synapse.w)));
                    
                }
            });
            // Post-fire recovery
            setTimeout(() => {
                this.potential = 0;
                this.isfiring = false;
                this.emit('ready', this.id);
            }, SIGNAL_RECOVERY_DELAY);
        }
        return true;
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

    static alpha(length) {
        var output = '';
        do {
            output += Math.random().toString('16').substr(2);
            if (output.length > length) {
                output = output.substr(0,length);
            }
        } while (length > 0 && output.length < length)
        return output;
    }
}

module.exports = NeuralNetwork;