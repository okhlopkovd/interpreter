import { reserevedKeywords } from './../constants/reserved-keywords.constant';
import { Token } from './../interfaces/token.interface';
import { TokenType } from '../enums/token-type.enum';

export class Lexer {

  private pos = 0;

  constructor (private text: string) {}

  private isNumber = (value: string) => !isNaN(parseInt(value));
  private isLetter = (value: string) => /[a-zA-Z]/.test(value);
  private isWhitespace = (value: string) => /^\s*$/.test(value);
  private isNumberOrLetter = (value: string) => this.isLetter(value) || this.isNumber(value);

  peek(): string | null {
    return this.pos + 1 > this.text.length - 1 ? null : this.text[this.pos + 1];
  }

  keywordOrId(): Token {
    let result = '';

    while (this.pos < this.text.length && this.isNumberOrLetter(this.text[this.pos])) {
      result += this.text[this.pos];
      this.pos++;
    }

    return reserevedKeywords[result] 
      ? reserevedKeywords[result] 
      : { type: TokenType.ID, value: result };
  }

  getFullNumber(): Token {
    let result = '';
    while (this.pos < this.text.length && this.isNumber(this.text[this.pos])) {
      result += this.text[this.pos];
      this.pos++;
    }

    if (this.text[this.pos] === '.') {
      result += this.text[this.pos];
      this.pos++;

      while (this.pos < this.text.length && this.isNumber(this.text[this.pos])) {
        result += this.text[this.pos];
        this.pos++;
      }

      return { type: TokenType.REAL,  value: parseFloat(result) };
    }

    return { type: TokenType.INTEGER,  value: parseInt(result) };
  }

  skipWhitespaces(): void {
    while (this.pos < this.text.length && this.isWhitespace(this.text[this.pos])) {
      this.pos++;
    }
  }

  getNextToken(): Token {
    if (this.pos > this.text.length - 1) {
      return { type: TokenType.EOF };
    }

    if (this.isWhitespace(this.text[this.pos])) {
      this.skipWhitespaces();
    }

    if (this.isLetter(this.text[this.pos])) {
      return this.keywordOrId();
    }

    if (this.isNumber(this.text[this.pos])) {
      return this.getFullNumber();
    }

    if (this.text[this.pos] === ':' && this.peek() === '=') {
      this.pos += 2;
      return { type: TokenType.ASSIGN };
    }

    if (this.text[this.pos] === '=' && this.peek() === '=') {
      this.pos += 2;
      return { type: TokenType.EQUALS };
    }

    if (this.text[this.pos] === '!' && this.peek() === '=') {
      this.pos += 2;
      return { type: TokenType.NOT_EQUALS };
    }

    if (this.text[this.pos] === '>' && this.peek() === '=') {
      this.pos += 2;
      return { type: TokenType.GTE };
    }

    if (this.text[this.pos] === '<' && this.peek() === '=') {
      this.pos += 2;
      return { type: TokenType.LTE };
    }

    if (this.text[this.pos] === '>') {
      this.pos++;
      return { type: TokenType.GT };
    }

    if (this.text[this.pos] === '<') {
      this.pos++;
      return { type: TokenType.LT };
    }

    if (this.text[this.pos] === ';') {
      this.pos++;
      return { type: TokenType.SEMICOLON };
    }

    if (this.text[this.pos] === '.') {
      this.pos++;
      return { type: TokenType.DOT };
    }

    if (this.text[this.pos] === ':') {
      this.pos++;
      return { type: TokenType.COLON };
    }

    if (this.text[this.pos] === ',') {
      this.pos++;
      return { type: TokenType.COMMA };
    }

    if (this.text[this.pos] === '+') {
      this.pos++;
      return { type: TokenType.PLUS };
    }

    if (this.text[this.pos] === '-') {
      this.pos++;
      return { type: TokenType.MINUS };
    }

    if (this.text[this.pos] === '*') {
      this.pos++;
      return { type: TokenType.MULT };
    }

    if (this.text[this.pos] === '/') {
      this.pos++;
      return { type: TokenType.DIV };
    }

    if (this.text[this.pos] === '(') {
      this.pos++;
      return { type: TokenType.LPAREN };
    }

    if (this.text[this.pos] === ')') {
      this.pos++;
      return { type: TokenType.RPAREN };
    }

    throw new Error('Error parsing input in getNextToken');
  }
}