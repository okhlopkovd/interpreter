import { TokenType } from './../enums/token-type.enum';

export interface Token {
  type: TokenType;
  value?: any;
}