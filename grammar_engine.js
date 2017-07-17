/*
 Utility function to get the recently
 added element in the array as it's a stack.
 */
function getTop(arr) {
    return (arr && arr.length > 0) ? arr[arr.length - 1]
                                  : undefined;
};

/*
 * Being recursive, this function acts as a wrapper by supplying the nextSymbols
 * array which just accumulates all possible literals from all possible
 * productions corresponding to the grammar(s) in the pathTrail.
 * 
 * pathTrail is an array of objects which are of the form [ { grammarName:
 * 'grammar_if_statement', currentSymbolChosen: { symbol: 'if', symbolIndex:0 ,
 * productionIndex:0 } } ];
 * 
 * The pathTrail serves as a stack which always keep track of what has been
 * chosen so far by the user and serves as the input to get next symbols.
 */
function getNextSymbols(pathTrail) {
    console.log('getNextSymbols() fired...');

    var nextSymbols = [];
    var processedGrammars = [];
    _getNextSymbols(pathTrail, processedGrammars, nextSymbols);
    console.log('nextSymbols : ' + JSON.stringify(nextSymbols));
    console.log('pathTrail : ' + JSON.stringify(pathTrail));
    return nextSymbols;
}

/*
 * The crux is to get all next level terminals. If there are no terminals, yet
 * there are some next level nonTerminals, then iterate through each of them and
 * get all first level terminals.
 */
function _getNextSymbols(pathTrail, processedGrammars, nextSymbols) {
    console.log('invoked _getNextSymbols()...');
    console.log('pathTrail : ' + JSON.stringify(pathTrail));
    console.log('nextSymbols : ' + JSON.stringify(nextSymbols));

    if (pathTrail) {
        // Get the recent grammar for which we are looking for the next symbols
        // based on the recent symbol that has got chosen by the user.
        var latestGrammar = getTop(pathTrail);
        var grammar = grammars[latestGrammar.grammarName];
        if (grammar) {
            // Looks we haven't suggested anything for the user and this is the
            // first time, we are looking for nextSymbols for this grammar.
            console.log('latestGrammar.currentSymbolChosen -> ' + JSON.stringify(latestGrammar.currentSymbolChosen));
            if (latestGrammar.currentSymbolChosen === null) {
                console.log('Entered first time invocation of getNextSymbols()...');
                // Iterate through all the productions of this grammar
                // and check the first symbol.
                // If it's a terminal, then add it to the list of nextSymbols.
                var terminalsFound = false;
                for ( var index in grammar.productions) {
                    var production = grammar.productions[index];
                    if (production && production.length > 0) {
                        if (production[0].nonTerminal === false) {
                            terminalsFound = true;
                            nextSymbols.push({
                                grammarName : latestGrammar.grammarName,
                                symbol : production[0].symbol,
                                symbolIndex : 0,
                                productionIndex : index
                            });
                            console.log('Done retrieving symbols for the first time.');
                        }
                    }
                } // for

                // when there are no terminals to be shown that is part of this grammar,
                // look for productions that starts with a non-terminal.
                if (terminalsFound === false) {
                    var foundNonTerminalProductions = false;

                    for ( var index in grammar.productions) {
                        if (grammar.productions[index][0].nonTerminal === true) {
                            foundNonTerminalProductions = true;
                            var nonTerminalProduction = grammar.productions[index];
                            // To avoid duplication of suggestions(terminals),
                            // we don't have to process that same grammar again
                            // though it is the first symbol in another production
                            // for the same grammar.
                            if (processedGrammars.indexOf(nonTerminalProduction[0].symbol) === -1) {
                                // for remembrance sake.
                                processedGrammars.push(nonTerminalProduction[0].symbol);
                                pathTrail.push({
                                    grammarName : nonTerminalProduction[0].symbol,
                                    currentSymbolChosen : null
                                });
                                _getNextSymbols(pathTrail, processedGrammars, nextSymbols);
                            }
                        }
                    }
                    // If we are here, then there would be no terminals left to be show
                    // for this grammar.
                    // Yet, we have to go one step back and process the grammar if any
                    // that is still there without reaching the final state of the production.
                    if (foundNonTerminalProductions === false && pathTrail.length > 1) {
                        return _getNextSymbols(pathTrail.slice(0, pathTrail.length - 1), processedGrammars, nextSymbols);
                    }
                }
            } // if
            else {
                console.log('Entering block which processes nextSymbols for a previous user selection.');
                // Looks the user has chosen a symbol which has already been
                // suggested to him. Now get the next symbols.(Literals)
                var production = grammar.productions[latestGrammar.currentSymbolChosen.productionIndex];
                if (production) {
                    // check whether the user selected symbol is the last symbol in that production.
                    var alreadyAtLastSymbol = (production.length - 1) === latestGrammar.currentSymbolChosen.symbolIndex;
                    console.log('alreadyAtLastSymbol : ' + alreadyAtLastSymbol);
                    if (!alreadyAtLastSymbol) {
                        var nextIndex = latestGrammar.currentSymbolChosen.symbolIndex + 1;
                        if (production[nextIndex].nonTerminal === false) {
                            console.log('Symbol [' + production[nextIndex].symbol + '] @ index ' + nextIndex
                                    + ' is a Terminal');
                            nextSymbols.push({
                                grammar : latestGrammar.grammarName,
                                symbol : production[nextIndex].symbol,
                                symbolIndex : nextIndex,
                                productionIndex : latestGrammar.currentSymbolChosen.productionIndex
                            });
                        } else {
                            console.log('Symbol [' + production[nextIndex].symbol + '] @ index ' + nextIndex
                                    + ' is a Non-Terminal');
                            pathTrail.push({
                                grammarName : production[nextIndex].symbol,
                                currentSymbolChosen : null
                            });
                            _getNextSymbols(pathTrail, processedGrammars, nextSymbols);
                        }
                    } else {
                        // Since we are at the last symbol of the current production already,
                        // we should check for any other productions that starts
                        // with a nonTerminal.
                        // If not, move one step back, start getting nextSymbols
                        // from the previous grammar in the traversedPath.
                        var foundNonTerminalProductions = false;

                        for ( var index in grammar.productions) {
                            if (grammar.productions[index][0].nonTerminal === true) {
                                foundNonTerminalProductions = true;
                                var nonTerminalProduction = grammar.productions[index];
                                if (!processedGrammars
                                        || (processedGrammars.indexOf(nonTerminalProduction[0].symbol) === -1)) {
                                    processedGrammars.push(nonTerminalProduction[0].symbol);
                                    pathTrail.push({
                                        grammarName : nonTerminalProduction[0].symbol,
                                        currentSymbolChosen : null
                                    });
                                    _getNextSymbols(pathTrail, processedGrammars, nextSymbols);
                                }
                            }
                        }

                        if (foundNonTerminalProductions === false && pathTrail.length > 1) {
                            return _getNextSymbols(pathTrail.slice(0, pathTrail.length - 1), processedGrammars,
                                    nextSymbols);
                        }
                    }
                } // else
            } // if
        } // if(grammar)
    } // if(pathTrail)
} // function

