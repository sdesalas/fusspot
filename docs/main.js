(function() {

const query = location.search.substring(1).split("&").reduce(function(prev, curr, i, arr) {
    var p = curr.split("=");
    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
    return prev;
}, {});

const NeuralNetwork = require('../NeuralNetwork');
window.NeuralNetwork = NeuralNetwork;
window.network = new NeuralNetwork(Number(query.size) || 80, query.shape || 'ball');
display(network);

})();
