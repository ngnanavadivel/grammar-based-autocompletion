/*
 Utility function to get the recently
 added element in the array as if it's a stack.
 */
function getTop(arr) {
    return (arr && arr.length > 0) ? arr[arr.length - 1]
                                  : undefined;
};

function UserSelection(grammarName, chosenSymbol, chosenSymbolIndex, chosenProductionIndex, isTerminal) {
    this.grammarName = grammarName;
    this.chosenSymbol = chosenSymbol;
    this.chosenSymbolIndex = chosenSymbolIndex;
    this.chosenProductionIndex = chosenProductionIndex;
    this.isTerminal = isTerminal;	
}

function UserSelectionTrail() {
    this.selections = [];
}

UserSelectionTrail.prototype.addSelection = function(userSelection) {
    this.selections.push(userSelection);
}

function getAllTerminals(grammarName) {
    var terminals = [];
    var processedGrammars = [];
    _getAllTerminals(grammarName, processedGrammars,
                     terminals);
    return terminals;
}

function _getAllTerminals(grammarName, processedGrammars, terminals) {
    if(!processedGrammars) {
        processedGrammars = [];
    }
    if(!terminals) {
        terminals = [];
    }
    if(processedGrammars.indexOf(grammarName) >= 0) {
        return;
    }
    var grammar = grammars[grammarName];
    if (grammar) {
        var productions = grammar.productions;
        for ( var index in productions) {
            var production = productions[index];
            var firstSymbol = production.symbols[0];
            if (firstSymbol.nonTerminal === false) {
                terminals.push(new UserSelection(grammarName,
                                                 firstSymbol.symbol,
                                                 0,
                                                 index,
                                                 true));
                processedGrammars.push(grammarName);
            } else {
                _getAllTerminals(firstSymbol.symbol, processedGrammars,
                                 terminals);
            }
        }
    }
}

function getAllNextTerminals(userSelectionTrail) {
    var terminals = [];
    var processedGrammars = [];
    _getAllNextTerminals(userSelectionTrail, processedGrammars,
                         terminals);
    return terminals;
}

function _getAllNextTerminals(userSelectionTrail, processedGrammars, terminals) {
    if(!processedGrammars) {
        processedGrammars = [];
    }
    if(!terminals) {
        terminals = [];
    }
    var lastSymbolSelection = getTop(userSelectionTrail.selections);
    if(processedGrammars.indexOf(lastSymbolSelection.grammarName) >=0 ){
		console.log('Avoided processing ' + lastSymbolSelection.grammarName);
        return;
    }
    var grammar = grammars[lastSymbolSelection.grammarName];
    if (grammar) {
        var chosenProduction = grammar.productions[lastSymbolSelection.chosenProductionIndex];
        if (chosenProduction) {
            //var chosenSymbol = chosenProduction.symbols[lastSymbolSelection.chosenSymbolIndex];
			var chosenSymbol = lastSymbolSelection.chosenSymbol;
            if (lastSymbolSelection.isTerminal == true) {
                var moreSymbolsToProcess = lastSymbolSelection.chosenSymbolIndex < (chosenProduction.symbols.length - 1);
                if (moreSymbolsToProcess) {
                    var nextSymbolIndex = lastSymbolSelection.chosenSymbolIndex + 1;
                    var nextSymbol = chosenProduction.symbols[nextSymbolIndex];
                    if (nextSymbol.nonTerminal === false) {
                        terminals.push(new UserSelection(lastSymbolSelection.grammarName,
                                                         nextSymbol.symbol,
                                                         nextSymbolIndex,
                                                         lastSymbolSelection.chosenProductionIndex,
                                                         true));
                        processedGrammars.push(lastSymbolSelection.grammarName);
                    } else {
                        // what if the nextSymbol is a nonTerminal?
						userSelectionTrail.addSelection(new UserSelection(lastSymbolSelection.grammarName,
                                                                          nextSymbol.symbol,
                                                                          nextSymbolIndex,
                                                                          lastSymbolSelection.chosenProductionIndex,
                                                                          false));
                        /*_getAllNextTerminals(userSelectionTrail,
                                             terminals);*/
                        _getAllTerminals(nextSymbol.symbol, processedGrammars,
                                         terminals);						
						
                    }
                } else { // No more symbols in the chosen production to process for terminals.
                    // Let's see whether do we have any symbol selected in the terminalTrail which is a nonTerminal.
                    // If we have one, we should continue processing it.
										
					for(var index in grammar.productions) {
						var production = grammar.productions[index];
						if(production.symbols[0].symbol === grammar.name) {										
							userSelectionTrail.addSelection(new UserSelection(grammar.name,
                                                                          grammar.name,
                                                                          0,
                                                                          index,
                                                                          false)); //kludge
							_getAllNextTerminals(userSelectionTrail, processedGrammars, terminals);
						}
					}
					
					
					var poppedSelection = userSelectionTrail.selections.pop();
					//var terminalChosen = poppedSelection.chosenSymbol;
					
					var penultimateSelection = getTop(userSelectionTrail.selections);
					//penultimateSelection.isTerminal = true;
					while(penultimateSelection.grammarName === poppedSelection.grammarName) {
						userSelectionTrail.selections.pop();
						penultimateSelection = getTop(userSelectionTrail.selections);						
					}
					// update the literal.
					/*penultimateSelection.chosenSymbol = terminalChosen;
					penultimateSelection.chosenSymbolIndex += 1;*/
					_getAllTerminalsOfProductionsThatStartsWith(penultimateSelection.grammarName, poppedSelection.grammarName, terminals);
					//_getAllNextTerminals(userSelectionTrail, processedGrammars, terminals);
					/*backTrack(userSelectionTrail,
							  processedGrammars,
							  terminals);*/
					
                }
            } else {
                // In case if the current symbol chosen is a nonTerminal.
                // This happens only during nextSymbol lookup for a nonTerminal.
                console.log('am wierdly here....help me bro!');
				_getAllTerminals(chosenSymbol.symbol, processedGrammars, terminals);
            }
        }
    }
}

function backTrack(userSelectionTrail, processedGrammars, terminals) {
    var poppedSelection = userSelectionTrail.selections.pop();
    var nextSymbolToLookFor = poppedSelection.chosenSymbol;

    var penultimateSelection = getTop(userSelectionTrail.selections);
    if (penultimateSelection.isTerminal === false) {
        var prevGrammar = grammars[penultimateSelection.grammarName];
        var prevProductions = prevGrammar.productions;
        var gotAMatch = false;
        for ( var index in prevProductions) {
            var prevProduction = prevProductions[index];
            if (prevProduction.symbols[0].symbol === nextSymbolToLookFor) {
                gotAMatch = true;
                if (prevProduction.symbols[1].nonTerminal === false) {
                    terminals.push(new UserSelection(prevGrammar.grammarName,
                                                     prevProduction.symbols[1].symbol,
                                                     1,
                                                     index,
                                                     true));
                    processedGrammars.push(prevGrammar.grammarName);
                } else {
                    userSelectionTrail.addSelection(new UserSelection(prevGrammar.grammarName,
                                                                      prevProduction.symbols[1].symbol,
                                                                      1,
                                                                      index,
                                                                      false));
                    _getAllTerminals(nextSymbolToLookFor, processedGrammars,
                                         terminals);
                }
            }
        }
        if(!gotAMatch) {
            backTrack(userSelectionTrail, processedGrammars, terminals);
        }
    }
	else {
		_getAllNextTerminals(userSelectionTrail, processedGrammars, terminals);
	}
}

function getAllTerminalsOfProductionsThatStartsWith(grammarName, startingSymbol) {
	var terminals = [];
	_getAllTerminalsOfProductionsThatStartsWith(grammarName, startingSymbol, terminals);
	return terminals;
}

function _getAllTerminalsOfProductionsThatStartsWith(grammarName, startingSymbol, terminals) {
	var grammar = grammars[grammarName];
	var productions = grammar.productions;
	for(var index in productions) {
		var production = productions[index];
		if(production.symbols[0] === startingSymbol) {
			_getAllNextTerminals([{grammarName: grammarName, chosenSymbol: startingSymbol, chosenSymbolIndex: 0, chosenProductionIndex: index}], null, terminals);
		}
	}
}

function getSuggestions(userSelectionTrail) {
    if (userSelectionTrail.selections.length == 1 && userSelectionTrail.selections[0].chosenSymbol === null) {
        return getAllTerminals(userSelectionTrail.selections[0].grammarName);
    } else {
        return getAllNextTerminals(userSelectionTrail);
    }
}
