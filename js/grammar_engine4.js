var selectionStack = new UserSelectionStack();

function getSuggestionsWhenNothingIsChosen(grammarName) {
    var suggestions = [];
    var processedGrammars = [];
    _getSuggestionsWhenNothingIsChosen(grammarName, processedGrammars, suggestions);
    return suggestions;
}

function _getSuggestionsWhenNothingIsChosen(grammarName, processedGrammars, suggestions) {
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
            suggestions.push(new UserSelection(grammarName, production.symbols[0].symbol, 0, index, true, production.symbols[0].category, production.symbols[0].tokenType));
            processedGrammars.push(grammarName);
        }
        // In case of a Non-Terminal
        else {
            _getSuggestionsWhenNothingIsChosen(production.symbols[0].symbol, processedGrammars, suggestions);
        }
    }
}

function getSuggestionsForUserSelection(userSelection) {
    var terminals = [];
    var processedGrammars = [];
    _getSuggestionsForUserSelection(userSelection, processedGrammars, terminals);
    return terminals;
}

function _getSuggestionsForUserSelection(userSelection, processedGrammars, terminals) {
   if(selectionStack.isEmpty() || selectionStack.top().productionIndex !== userSelection.chosenProductionIndex) {
       selectionStack.push(userSelection.getStackEntry());
   }
   
   var grammar = grammars[userSelection.grammarName];
   if(grammar) {
       var production = grammar.productions[userSelection.chosenProductionIndex];
       var lastSymbol = (production.symbols.length - 1) === userSelection.chosenSymbolIndex;
       if(lastSymbol) {
           console.log('Last Symbol!');
           console.log('selectionStack :\n' + JSON.stringify(selectionStack));
           var top = selectionStack.top();
           if(top && userSelection.grammarName === top.grammar ) { // different productions of same grammar            
               top.symbolIndex += 1;
               _getSuggestionsForUserSelection(top.getUserSelection(), processedGrammars, terminals)
           }
           else {
               var popped = selectionStack.pop();
               var top = selectionStack.top();
               if(top) {
                   var newUserSelection = top.getUserSelection();
                   newUserSelection.chosenSymbol = popped.grammar;
                   newUserSelection.chosenSymbolIndex += 1;
                   
                   _getSuggestionsForUserSelection(newUserSelection, processedGrammars, terminals)
               }
           }
           
       }
       else {
           var nextSymbol = production.symbols[userSelection.chosenSymbolIndex + 1];
           if(nextSymbol.nonTerminal === false) {
               var top = selectionStack.top();
               top.symbolIndex += 1;
               
               terminals.push(new UserSelection(userSelection.grammarName, nextSymbol.symbol, (userSelection.chosenSymbolIndex + 1), userSelection.chosenProductionIndex, true, nextSymbol.category, nextSymbol.tokenType));
           }
           else {
               // Non-Terminal
               var top = selectionStack.top();
               top.grammar = nextSymbol.symbol;
               top.symbolIndex += 1;
               
               _getSuggestionsWhenNothingIsChosen(nextSymbol.symbol, processedGrammars, terminals);
           }
       }
   }
   console.log('(Finally) selectionStack :\n' + JSON.stringify(selectionStack));
}


///////////////////////////////////////////////////////// Utilities ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
};

UserSelection.prototype.getStackEntry = function() {
  return new StackEntry(this.grammarName, this.chosenSymbolIndex, this.chosenProductionIndex);  
};

function StackEntry(grammar, symbolIndex, productionIndex) {
  this.grammar = grammar;
  this.symbolIndex = symbolIndex;
  this.productionIndex = productionIndex;
};

StackEntry.prototype.getUserSelection = function() {
    var grammar = grammars[this.grammar];
    if(grammar) {
        var symbol = grammar.productions[this.productionIndex].symbols[this.symbolIndex];
        return new UserSelection(this.grammar, symbol.symbol, this.symbolIndex, this.productionIndex, !symbol.nonTerminal, symbol.category, symbol.tokenType);
    }
}

function UserSelectionStack() {
    this.selections = [];
};

UserSelectionStack.prototype.push = function(userSelection) {
    this.selections.push(userSelection);
};

UserSelectionStack.prototype.pop = function() {
    return this.selections.pop();
};

UserSelectionStack.prototype.top = function() {
    return getTop(this.selections);
};

UserSelectionStack.prototype.isEmpty = function() {
    return this.selections.length === 0;
};