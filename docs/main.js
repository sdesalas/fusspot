(function() {

const NeuralNetwork = require('../NeuralNetwork');
window.NeuralNetwork = NeuralNetwork;
window.network = new NeuralNetwork(80);
display(network);

})();
