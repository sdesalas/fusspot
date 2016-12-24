# fusspot

[![Build Status](https://travis-ci.org/sdesalas/fusspot.svg?branch=master)](https://travis-ci.org/sdesalas/fusspot)

Fusspot is a learning engine I've been meaning to write for 20-odd years. Its only now that it has become relevant as I am building [nodebots](http://nodebots.io/).

Fusspot is non-deterministic, you can train it to be biased towards certain responses with training and patience, but it will just as likely learn on its own and do whatever it likes. 

At present it uses a simple grid of inputs and outputs, with links between them (think squares in a game of chess) being biased positively and negatively depending on training. Choices are made randomly but biased according to the weight assigned to each square. 

While this is sufficient for very simplistic binary scenarios, for more complex scenarios (ie time-series input from analog sensors) it ts necessary to vectorise inputs so that the engine is called with the group signature rather than each individual input.
