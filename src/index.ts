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
   a := 32;
   b := 33;
   IF a == b BEGIN
      a := 35;
   END ELSE BEGIN
      a := 12;
   END;
   b := 10 * a + 10 * a DIV 4;
   y := 20 / 7 + 3.14;
END.
`;

const lexer = new Lexer(text);
const parser = new Parser(lexer);
const interpreter = new Interpreter(parser);
interpreter.interpret()

console.log(Memory.getMemory().getData());