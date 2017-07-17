var grammars = {
	grammar_if_statement: {
		productions: [
			[
				{ symbol: "if", nonTerminal: false},
				{ symbol: "(", nonTerminal: false},
				{ symbol: "grammar_conditional_expression", nonTerminal: true, occurances: "ONCE"},
				{ symbol: ")", nonTerminal: false},
				{ symbol: "grammar_action_block", nonTerminal: true, occurances: "ONCE"},
				{ symbol: "grammar_else_if_statement", nonTerminal: true, occurances: "UNBOUNDED"},
				{ symbol: "else", nonTerminal: false},
				{ symbol: "grammar_action_block", nonTerminal: true, occurances: "ONCE"},
			]
		]
	},

	grammar_else_if_statement: {
		productions: [
			[
				{ symbol: "else if", nonTerminal: false},
				{ symbol: "(", nonTerminal: false},
				{ symbol: "grammar_conditional_expression", nonTerminal: true, occurances: "ONCE"},
				{ symbol: ")", nonTerminal: false},
				{ symbol: "grammar_action_block", nonTerminal: true, occurances: "ONCE"}
			]
		]
	},

	grammar_action_block: {
		productions: [
			[
				{ symbol: "{", nonTerminal: false},
				{ symbol: "grammar_action_block_statement", nonTerminal: true, occurances: "UNBOUNDED"},
				{ symbol: "}", nonTerminal: false}
			]
		]
	},

	grammar_action_block_statement: {
		productions: [
			[
				{symbol: "VARIABLE", nonTerminal:false},
				{symbol: "=", nonTerminal:false},
				{symbol: "grammar_any_expression", nonTerminal:true, occurances: "ONCE"},
				{symbol: ";", nonTerminal:false}
			]
		]
	},

  grammar_any_expression: {
    productions: [
      [
        {symbol: "grammar_arithmetic_expression", nonTerminal: true, occurances: "ONCE"}
      ],
      [
        {symbol: "grammar_conditional_expression", nonTerminal: true, occurances: "ONCE"}
      ]
    ]
  },

  grammar_conditional_expression: {
    productions: [
      [
        {symbol: "grammar_relational_expression", nonTerminal: true, occurances: "ONCE"}
      ],
      [
        {symbol: "grammar_logical_expression", nonTerminal: true, occurances: "ONCE"}
      ]
    ]
  },

  grammar_logical_expression: {
    productions: [
      [
        {symbol: "grammar_relational_expression", nonTerminal:true, occurances:"ONCE"},
        {symbol: "grammar_relational_operator", nonTerminal:true, occurances:"ONCE"},
        {symbol: "grammar_relational_expression", nonTerminal:true, occurances:"ONCE"}
      ]
    ]
  },

  grammar_relational_operator: {
    productions: [
      [
        {symbol: "equals", nonTerminal:false}
      ],
      [
        {symbol: "not equals", nonTerminal:false}
      ],
      [
        {symbol: "greater than", nonTerminal:false}
      ],
      [
        {symbol: "less than", nonTerminal:false}
      ],
      [
        {symbol: "greater than or equals", nonTerminal:false}
      ],
      [
        {symbol: "less than or equals", nonTerminal:false}
      ]
    ]
  },

  grammar_relational_expression: {
    productions: [
      [
        {symbol: "grammar_arithmetic_expression", nonTerminal:true, occurances: "ONCE"},
        {symbol: "grammar_relational_operator", nonTerminal:true, occurances: "ONCE"},
        {symbol: "grammar_arithmetic_expression", nonTerminal:true, occurances: "ONCE"}
      ]
    ]
  },

  grammar_relational_operator: {
    productions: [
      [
        {symbol: "AND", nonTerminal: false}
      ]
      ,
      [
        {symbol: "OR", nonTerminal: false},
      ]
    ]
  },

  grammar_arithmetic_expression: {
    productions: [
      [
        {symbol: "VARIABLE", nonTerminal:false},
        {symbol: "grammar_arithmetic_operator", nonTerminal:true, occurances: "ONCE"},
        {symbol: "VARIABLE", nonTerminal:false}
      ],
      [
        {symbol: "(", nonTerminal:false},
        {symbol: "grammar_arithmetic_expression", nonTerminal:true, occurances: "ONCE"},
        {symbol: "grammar_arithmetic_operator", nonTerminal:true, occurances: "ONCE"},
        {symbol: "grammar_arithmetic_expression", nonTerminal:true, occurances: "ONCE"},
        {symbol: ")", nonTerminal:false},
      ]
    ]
  },

  grammar_arithmetic_operator: {
    productions: [
      [
        {symbol: "+", nonTerminal: false}
      ],
      [
        {symbol: "-", nonTerminal: false}
      ],
      [
        {symbol: "*", nonTerminal: false}
      ],
      [
        {symbol: "/", nonTerminal: false}
      ],
      [
        {symbol: "%", nonTerminal: false}
      ]
    ]
  }
};
