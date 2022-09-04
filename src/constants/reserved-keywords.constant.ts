import { TokenType } from './../enums/token-type.enum';
import { Token } from './../interfaces/token.interface';


export const reserevedKeywords: { [key: string]: Token } = {
  'PROGRAM': { type: TokenType.PROGRAM },
  'BEGIN': { type: TokenType.BEGIN },
  'VAR': { type: TokenType.VAR },
  'DIV': { type: TokenType.INTEGER_DIV },
  'END': { type: TokenType.END },
  'INTEGER': { type: TokenType.INTEGER_NUM },
  'REAL': { type: TokenType.REAL },
  'IF': { type: TokenType.IF },
  'ELSE': { type: TokenType.ELSE },
  'WHILE': { type: TokenType.WHILE },
};