function Symbol(symbol, nonTerminal, occurrences, category, tokenType) {
    this.symbol = symbol;
    this.nonTerminal = nonTerminal;
    this.occurrences = occurrences;
    this.category = category;
    this.tokenType = tokenType;
}

function Production() {
    this.symbols = [];
}

Production.prototype.addSymbol = function(symbol) {
    this.symbols.push(symbol);
    return this; // to facilitate chaining.
};

function Grammar(name) {
    this.name = name;
    this.productions = [];
}

Grammar.prototype.addProduction = function(production) {
    this.productions.push(production);
    return this; // to facilitate chaining.
};


var grammar_if_statement = new Grammar('grammar_if_statement')
    .addProduction(new Production()
        .addSymbol(new Symbol('if', false, 1, 'Keywords', 'KEYWORD'))
        .addSymbol(new Symbol('(', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_conditional_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol(')', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_action_block', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_else_if_statement', true, -1, 'Non Terminals', 'NON_TERMINAL'))           // -1 means unbounded occurrences.
        .addSymbol(new Symbol('else', false, 1, 'Keywords', 'KEYWORD'))
        .addSymbol(new Symbol('grammar_action_block', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    );

var grammar_else_if_statement = new Grammar('grammar_else_if_statement')
    .addProduction(new Production()
        .addSymbol(new Symbol('else if', false, 1, 'Keywords', 'KEYWORD'))
        .addSymbol(new Symbol('(', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_conditional_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol(')', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_action_block', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    );

var grammar_action_block = new Grammar('grammar_action_block')
    .addProduction(new Production()
        .addSymbol(new Symbol('{', false, 1, 'Keywords', 'BRACES'))
        .addSymbol(new Symbol('grammar_action_block_statement', true, -1, 'Non Terminals', 'NON_TERMINAL'))      // -1 means unbounded occurrences.
        .addSymbol(new Symbol('}', false, 1, 'Keywords', 'BRACES'))
    );


var grammar_action_block_statement = new Grammar('grammar_action_block_statement')
    .addProduction(new Production()
        .addSymbol(new Symbol('VARIABLE', false, 1, 'Variables', 'VARIABLE'))
        .addSymbol(new Symbol('=', false, 1, 'Assignment Operator', 'OPERATOR'))
        .addSymbol(new Symbol('grammar_any_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol(';', false, 1, 'Keywords', 'KEYWORD'))
    );

var grammar_any_expression = new Grammar('grammar_any_expression')
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    )
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_conditional_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    );

var grammar_conditional_expression = new Grammar('grammar_conditional_expression')
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_relational_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    )
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_logical_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    );

var grammar_logical_expression = new Grammar('grammar_logical_expression')
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_relational_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_logical_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_relational_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    )
    .addProduction(new Production()
        .addSymbol(new Symbol('{', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_relational_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_logical_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_relational_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('}', false, 1, 'Keywords', 'PARANTHESIS'))
    );

var grammar_logical_operator = new Grammar('grammar_logical_operator')
    .addProduction(new Production()
        .addSymbol(new Symbol('AND', false, 1, 'Logical Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('OR', false, 1, 'Logical Operator', 'OPERATOR'))
    );
    
var grammar_relational_expression = new Grammar('grammar_relational_expression')
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_relational_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    ) 
    .addProduction(new Production()
        .addSymbol(new Symbol('[', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_relational_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol(']', false, 1, 'Keywords', 'PARANTHESIS'))
    );

var grammar_relational_expression_with_braces = new Grammar('grammar_relational_expression_with_braces')
.addProduction(new Production()
    .addSymbol(new Symbol('(', false, 1, 'Keywords', 'PARANTHESIS'))
    .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    .addSymbol(new Symbol('grammar_relational_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    .addSymbol(new Symbol(')', false, 1, 'Keywords', 'PARANTHESIS'))
);

var grammar_relational_operator = new Grammar('grammar_relational_operator')
    .addProduction(new Production()
        .addSymbol(new Symbol('equals', false, 1, 'Relational Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('not equals', false, 1, 'Relational Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('greater than', false, 1, 'Relational Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('less than', false, 1, 'Relational Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('greater than or equals', false, 1, 'Relational Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('less than or equals', false, 1, 'Relational Operator', 'OPERATOR'))
    );

var grammar_arithmetic_expression = new Grammar('grammar_arithmetic_expression')
    .addProduction(new Production()		
        .addSymbol(new Symbol('VARIABLE', false, 1, 'Variables', 'VARIABLE'))
    )
    .addProduction(new Production()
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
    )
    .addProduction(new Production()
        .addSymbol(new Symbol('(', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_expression', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol(')', false, 1, 'Keywords', 'PARANTHESIS'))
    );

/*var grammar_arithmetic_expression_v2 = new Grammar('grammar_arithmetic_expression_v2')
    .addProduction(new Production()		
        .addSymbol(new Symbol('VARIABLE', false, 1, 'Variables', 'VARIABLE'))
    )
	.addProduction(new Production()
        .addSymbol(new Symbol('(', false, 1, 'Keywords', 'PARANTHESIS'))
        .addSymbol(new Symbol('grammar_arithmetic_expression_v2', true, 1, 'Non Terminals', 'NON_TERMINAL'))        
        .addSymbol(new Symbol(')', false, 1, 'Keywords', 'PARANTHESIS'))
    )
    .addProduction(new Production()        
        .addSymbol(new Symbol('grammar_arithmetic_expression_v2', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_operator', true, 1, 'Non Terminals', 'NON_TERMINAL'))
        .addSymbol(new Symbol('grammar_arithmetic_expression_v2', true, 1, 'Non Terminals', 'NON_TERMINAL'))        
    );	*/

var grammar_arithmetic_operator = new Grammar('grammar_arithmetic_operator')
    .addProduction(new Production()
        .addSymbol(new Symbol('+', false, 1, 'Arithmetic Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('-', false, 1, 'Arithmetic Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('*', false, 1, 'Arithmetic Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('/', false, 1, 'Arithmetic Operator', 'OPERATOR'))
    ).addProduction(new Production()
        .addSymbol(new Symbol('%', false, 1, 'Arithmetic Operator', 'OPERATOR'))
    );

var grammars = {
    grammar_if_statement: grammar_if_statement,
    grammar_else_if_statement: grammar_else_if_statement,
    grammar_action_block: grammar_action_block,
    grammar_action_block_statement: grammar_action_block_statement,
    grammar_any_expression: grammar_any_expression,
    grammar_conditional_expression: grammar_conditional_expression,
    grammar_logical_expression: grammar_logical_expression,
    grammar_logical_operator: grammar_logical_operator,
    grammar_relational_expression: grammar_relational_expression,
    grammar_relational_operator: grammar_relational_operator,
    grammar_arithmetic_expression: grammar_arithmetic_expression,
    grammar_arithmetic_operator: grammar_arithmetic_operator,
	/*grammar_arithmetic_expression_v2: grammar_arithmetic_expression_v2,*/
	grammar_relational_expression_with_braces: grammar_relational_expression_with_braces
};
