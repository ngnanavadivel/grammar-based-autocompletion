/*
1. Getting all Terminals(literals) for a given Grammar

This happens only when there is no prior user selection happened for that grammar.

Or while choosing the next Symbol for a grammar in a given production,
if the next symbol is a Non-Terminal, then we get to fetch all Terminals that are
reachable via this grammar or through any other grammar references in the current grammar.

Implementation:
*/
function getSuggestionsWhenNothingIsChosen(grammarName) {
	var terminals = [];
	var processedGrammars = [];
	_getSuggestionsWhenNothingIsChosen(grammarName, processedGrammars, terminals);
	return terminals;
}

function _getSuggestionsWhenNothingIsChosen(grammarName, processedGrammars, terminals) {
	if(processedGrammars.indexOf(grammarName) >= 0) {
		return;
	}
	var grammar = grammars[grammarName];
	if(!grammar) {
		return;
	}
	var productions = grammar.productions;
	
	for(var index in productions) {
		var production = productions[index];
		// In case of a Terminal.
		if(production.symbols[0].nonTerminal === false) {
			terminals.push(new UserSelection(grammarName, production.symbols[0].symbol, 0, index, true, production.symbols[0].category, production.symbols[0].tokenType));
			processedGrammars.push(grammarName);
		}
		// In case of a Non-Terminal
		else {
			_getSuggestionsWhenNothingIsChosen(production.symbols[0].symbol, processedGrammars, terminals);
		}
	}
}

/*
2. Getting the Next Possible Terminals for a symbol already chosen by a user for a given production of a grammar.

Basically, we knew what grammar to look for, which  production to go via chosenProductionIndex
and even which symbolIndex we are going to introspect next via (chosenSymbolIndex + 1).

Here there could be many corner cases as follows:

1. what if the symbol that was already chosen by the user is the last symbol of the production? If yes, where to go next?

2. When there are more symbols yet to process in that production and the symbol that is next to user's choice is a Terminal?

3. When there are more symbols yet to process in that production and the symbol that is next to user's choice is a Non-Terminal?

3.1. while fetching the suggestions in case of a Non-Terminal, the suggestion themselves belongs to some other grammar?
How are we going to keep track where goes what?

Implementation:

*/

function getSuggestionsForUserSelection(userSelectionTrail) {
	var terminals = [];
	var processedGrammars = [];
	_getSuggestionsForUserSelection(userSelectionTrail, processedGrammars, terminals);
	return terminals;
}

function _getSuggestionsForUserSelection(userSelectionTrail, processedGrammars, terminals) {
    console.log("_getSuggestionsForUserSelection()\nInput : \n" + JSON.stringify(userSelectionTrail));
	var userSelection = getTop(userSelectionTrail.selections);
	var grammarName = userSelection.grammarName;
	var chosenSymbol = userSelection.chosenSymbol;
	var chosenSymbolIndex = userSelection.chosenSymbolIndex;
	var chosenProductionIndex = userSelection.chosenProductionIndex;
	
	if(processedGrammars.indexOf(grammarName) >= 0) {
		return;
	}
	
	var grammar = grammars[grammarName];
	var production = grammar.productions[chosenProductionIndex];
	var lastSymbol = chosenSymbolIndex === (production.symbols.length - 1);
	if(lastSymbol) {
		// Yeah, that production is completely traversed.
		
		// Just check whether the symbolIndex of the user selection and the respective production's symbol size are same.
		// If No, overwrite the last selection's symbol, increment the symbolIndex and call getSuggestionsForUserSelection().
		// If they are same, just remove it from the input, update the new last selection's symbol with the removed selection's grammar name
		// and try to call getSuggestionsFromProductionsStartingWithThisSymbol(originalGrammarName, startingSymbol).
		// What is this originalGrammarName?
		// Let's say an if-statement will have a production like this. 
		// if(grammar_conditional_expression) grammar_action_block
		// Here Conditional_Expression will have terminals only under it's arithmetic_expression_grammar.
		// If we look for terminals on productions of Conditional_Expression which starts with arithmetic_expression,
		// It will lead to relational_expression.
		// If we looks for terminals on productions of conditional_expression which starts with relational_expression,
		// It will lead to Logical_expression.
		// Similarly, If we look for terminals on productions of conditional_expression which starts with logical_expression,
		// Yeah, conditional_expression itself has one such production and yet it has no terminals.
		// what does that mean?
		// we can treat (the literals so far we have gathered from) Logical_expression as conditional_expression itself,
		// and update the last selection's symbol from '(' to 'conditional_expression' and increment symbol index and then
		// call getSuggestionsForUserSelection() as usual.
		// That's fine. what's that originalGrammarName?
		// Hmmm. (A Dying man gains nothing by keeping secrets.)
		// we have to check whether the current grammar name and the grammarName (symbolName) as per the production's next symbol value.
		// I mean, after '(', the original grammar name whose productions we should look for is 'Conditional_Expression'.
		// For this grammarName, we will try to get next symbols of productions which would eventually starts with either arithmetic_expression,
		// relational_expression, logical_expression after every user selection going back and forth to the GUI.
		// In essence, we are building a complete Logical Expression initially from a arithmetic_expression, then making it a relational_expression,
		// and then making it a logical_expression.
		// Pretty easy, huh? It took me 2 full days to arrive till here. Yup, am an average guy with extraordinary conviction.
		
		// chop off the just completed grammar selections from userSelectionTrail 
		// and also others which share the same grammar name and production index.
		var popped = userSelectionTrail.selections.pop();
		
		var last = getTop(userSelectionTrail.selections);
		if((last !== undefined && last !== null)) {
    		var productionHasEnded = last.chosenSymbolIndex === grammars[last.grammarName].productions[last.chosenProductionIndex].symbols.length - 2;
    		
    		while((last !== undefined && last !== null) && (last.grammarName === grammarName) /*&& (last.chosenProductionIndex === chosenProductionIndex*/ && productionHasEnded) {
    			popped = userSelectionTrail.selections.pop();
    			last = getTop(userSelectionTrail.selections);
    			if(last !== undefined && last !== null) {
    			    productionHasEnded = last.chosenSymbolIndex === grammars[last.grammarName].productions[last.chosenProductionIndex].symbols.length - 2;
    			}
    		}
		}
	   /* if(!last) {
	        userSelectionTrail.selections.push(popped);
	        last = popped;
	    }*/
		if(last !== undefined && last !== null) {
    		// Also check the current grammar name matches the original one.
    		var originalGrammarName = grammars[last.grammarName].productions[last.chosenProductionIndex].symbols[last.chosenSymbolIndex + 1].symbol;
    		if(originalGrammarName === grammarName) {
    			// Now let's do the overwrite.
    			last.chosenSymbol = grammarName;
    			last.chosenSymbolIndex += 1;			
    			_getSuggestionsForUserSelection(userSelectionTrail, processedGrammars, terminals);
    		}
    		else {
    		     if(grammarName in grammars) {
    		         _getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, originalGrammarName, grammarName, processedGrammars, terminals);
    		     }
    		}
		}
		else {
            console.log("wierdly here! Processed last symbol yet no prior symbols too..");
            _getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, popped.grammarName, popped.grammarName, [], terminals);
            return;
        }
	}
	// Got some more symbols to process!
	else {
		var nextSymbolIndex = chosenSymbolIndex + 1;
		var nextSymbol = production.symbols[nextSymbolIndex];
		
		if(nextSymbol.nonTerminal === false) {
			// Yup, It's a terminal. Easy Peasy, Lemon Squeezy!
			terminals.push(new UserSelection(grammarName, nextSymbol.symbol, nextSymbolIndex, chosenProductionIndex, true, nextSymbol.category, nextSymbol.tokenType));
		}
		else {
			// Yeah. God damn, Non-Terminal!!!
			_getSuggestionsWhenNothingIsChosen(nextSymbol.symbol, processedGrammars, terminals);
		}
	}
}


function getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, originalGrammarName, startingSymbol) {
	var terminals = [];
	var processedGrammars = [];
	_getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, originalGrammarName, startingSymbol, processedGrammars, terminals);
	return terminals;
}

function _getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, originalGrammarName, startingSymbol, processedGrammars, terminals) {
    console.log("_getSuggestionsFromProductionsStartingWithThisSymbol()\nInput : \n" + JSON.stringify(userSelectionTrail));
	if(processedGrammars.indexOf(originalGrammarName) >= 0) {
		return;
	}
	var grammar = grammars[originalGrammarName];
	if(!grammar) {
		return; // to avoid recursing on terminals.
	}
	var productions = grammar.productions;
	
	for(var index in productions) {
		var production = productions[index];
		if(production.symbols[0].symbol === startingSymbol) {			
			if(production.symbols.length > 1) {
				// very crucial fix.
				userSelectionTrail.selections.push(new UserSelection(originalGrammarName, null, 0, index, true));
				processedGrammars.push(originalGrammarName);
				
				if(production.symbols[1].nonTerminal === false) {
					terminals.push(new UserSelection(originalGrammarName, production.symbols[1].symbol, 1, index, true, production.symbols[1].category, production.symbols[1].tokenType));
				}
				else  {
					_getSuggestionsWhenNothingIsChosen(production.symbols[1].symbol, processedGrammars, terminals);	
				}
			}
			else {
				//_getSuggestionsFromProductionsStartingWithThisSymbol(originalGrammarName, startingSymbol, processedGrammars, terminals);
				var sel = getTop(userSelectionTrail.selections);
				sel.chosenSymbol = originalGrammarName;
				sel.chosenSymbolIndex += 1;
				_getSuggestionsForUserSelection(userSelectionTrail, processedGrammars, terminals);
			}			
		}
		else {
			//_getSuggestionsFromProductionsStartingWithThisSymbol(userSelectionTrail, production.symbols[0].symbol, startingSymbol, processedGrammars, terminals);
		}
	}
}

/*
 Utility function to get the recently
 added element in the array as if it's a stack.
 */
function getTop(arr) {
    return (arr && arr.length > 0) ? arr[arr.length - 1]
                                  : undefined;
};

function UserSelection(grammarName, chosenSymbol, chosenSymbolIndex, chosenProductionIndex, isTerminal, category, tokenType) {
    this.grammarName = grammarName;
    this.chosenSymbol = chosenSymbol;
    this.chosenSymbolIndex = chosenSymbolIndex;
    this.chosenProductionIndex = chosenProductionIndex;
    this.isTerminal = isTerminal;
    this.category = category;
    this.tokenType = tokenType;
}

function UserSelectionTrail() {
    this.selections = [];
}

UserSelectionTrail.prototype.addSelection = function(userSelection) {
    this.selections.push(userSelection);
}