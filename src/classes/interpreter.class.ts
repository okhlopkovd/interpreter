import { Parser } from './parser.class';

export class Interpreter {
  constructor(private parser: Parser) {}

  interpret(): any {
    const tree = this.parser.parse();
    return tree.evaluate();
  }
}