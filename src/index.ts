import { Memory } from './classes/memory.class';
import { Parser } from './classes/parser.class';
import { Lexer } from './classes/lexer.class';
import { Interpreter } from './classes/interpreter.class';

const text = `
PROGRAM Part10AST;
VAR
   a, b : INTEGER;
   y    : REAL;

BEGIN
   FOR a := 1; a <= 30; a := a + 1 BEGIN
      b := a;
   END;
   y := 20 / 7 + 3.14;
END.
`;

const lexer = new Lexer(text);
const parser = new Parser(lexer);
const interpreter = new Interpreter(parser);
interpreter.interpret()

console.log(Memory.getMemory().getData());