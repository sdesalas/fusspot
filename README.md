# fusspot

[![Build Status](https://travis-ci.org/sdesalas/fusspot.svg?branch=master)](https://travis-ci.org/sdesalas/fusspot)

Fusspot is a learning engine I've been meaning to write for 20-odd years. Its only now that it has become relevant as I am building [nodebots](http://nodebots.io/).

Fusspot is non-deterministic, you can train it to be biased towards certain responses with training and patience, but it will just as likely learn on its own (ie, do what it likes rather than what its told). 

At present it uses a simple grid of inputs and outputs, with links between them (think squares in a game of chess) being biased positively and negatively depending on training. Choices are made randomly but biased according to the weight assigned to each square. 

```
var grid = new fusspot.Grid();
grid.output('red pill');
grid.output('blue pill');
grid.predict('left hand'); // 1/3 each pill, 1/3 nothing - and will remember its choice with until told otherwise.
grid.strengthen('left hand', 'red pill');
grid.strengthen('left hand', 'red pill');
grid.predict('left hand'); // will most likely say 'red pill', but not certainly.
```

While this is sufficient for very simplistic scenarios, more complex scenarios (think: time-series input from analog sensors) require inputs to be turned into vectors so that the engine is called with the vector signature covering a whole list of similar inputs rather than each individual one, I am currently doing this separately but might incorporate the process into this algorithm if I think it makes sense.
