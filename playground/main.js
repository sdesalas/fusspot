(function() {

const NeuralNetwork = require('../NeuralNetwork');
window.NeuralNetwork = NeuralNetwork;
window.network = new NeuralNetwork(100);
display(network);

})();
