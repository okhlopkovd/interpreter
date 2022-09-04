import { UnaryNode, ReservedKeywordsNode, VarNode, AssignNode, CompoundNode, BlockNode, VarDeclarationNode, TypeNode, ProgramNode, IfElseNode, WhileNode } from './../interfaces/nodes.interface';
import { BinNode, NumNode, TreeNode } from '../interfaces/nodes.interface';
import { TokenType } from '../enums/token-type.enum';
import { Lexer } from './lexer.class';

export class Parser { 

  private currentToken = this.lexer.getNextToken();

  constructor(private lexer: Lexer) {}

  eat(type: TokenType): void {
    // console.log('value', this.currentToken.value);
    // console.log('current token type', this.currentToken.type);
    // console.log('expected token type', type);
    if (this.currentToken.type === type) {
      this.currentToken = this.lexer.getNextToken();
      return;
    }

    throw new Error('Error parsing input in eat');
  }

  program(): TreeNode {
    this.eat(TokenType.PROGRAM);
    const varNode = this.variable();
    this.eat(TokenType.SEMICOLON);
    const block = this.block();
    return new ProgramNode('program', block);
  }

  block(): TreeNode {
    const declarations = this.declarations();
    const compound = this.compoundStatement();
    return new BlockNode(declarations, compound);
  }

  declarations(): TreeNode[] {
    const declarations: TreeNode[] = [];
    if (this.currentToken.type === TokenType.VAR) {
      this.currentToken = this.lexer.getNextToken();

      while (this.currentToken.type == TokenType.ID) {
        const varDeclarations = this.variableDeclaration();
        varDeclarations.forEach(decl => declarations.push(decl));
        this.eat(TokenType.SEMICOLON);
      }
    }

    return declarations;
  }

  variableDeclaration(): TreeNode[] {
    const varNodes = [new VarNode(this.currentToken)];
    this.eat(TokenType.ID);

    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      varNodes.push(new VarNode(this.currentToken));
      this.eat(TokenType.ID);
    }

    this.eat(TokenType.COLON);

    const typeNode = this.typeSpec();
    return varNodes.map(varNode => new VarDeclarationNode(varNode, typeNode));
  }

  typeSpec(): TreeNode {
    const token = this.currentToken;
    if (token.type === TokenType.INTEGER_NUM) {
      this.eat(TokenType.INTEGER_NUM);
    } else {
      this.eat(TokenType.REAL);
    }

    return new TypeNode(token);
  }

  statementList(): TreeNode[] {
    const node = this.statement();
    const results = [node];

    while (this.currentToken.type === TokenType.SEMICOLON) {
      this.eat(TokenType.SEMICOLON);
      results.push(this.statement());
    }

    if (this.currentToken.type === TokenType.ID) {
      throw new Error('Incorrect statement');
    }

    return results;
  }

  compoundStatement(): TreeNode {
    this.eat(TokenType.BEGIN);
    const nodes = this.statementList();
    this.eat(TokenType.END);

    return new CompoundNode(nodes)
  }

  ifElseStatement(): TreeNode {
    this.eat(TokenType.IF);
    const statement = this.term();
    const ifBlock = this.compoundStatement();

    let elseBlock;
    if (this.currentToken.type === TokenType.ELSE) {
      this.eat(TokenType.ELSE);
      elseBlock = this.compoundStatement();
    }

    return new IfElseNode(statement, ifBlock, elseBlock);
  }

  whileStatement(): TreeNode {
    this.eat(TokenType.WHILE);
    const statement = this.term();
    const whileBlock = this.compoundStatement();
    return new WhileNode(statement, whileBlock);
  }

  statement(): TreeNode {
    if (this.currentToken.type === TokenType.BEGIN) {
      return this.compoundStatement();
    }

    if (this.currentToken.type === TokenType.ID) {
      return this.assignmentStatement();
    }

    if (this.currentToken.type === TokenType.IF) {
      return this.ifElseStatement();
    }

    if (this.currentToken.type === TokenType.WHILE) {
      return this.whileStatement();
    }

    return this.empty();
  }

  assignmentStatement(): TreeNode {
    const token = this.currentToken;
    this.variable();
    this.eat(TokenType.ASSIGN);

    const right = this.expr();
    const node = new AssignNode(token, right);

    return node;
  }

  variable(): TreeNode {
    const node = new VarNode(this.currentToken);
    this.eat(TokenType.ID);
    return node;
  }

  empty(): TreeNode {
    return new ReservedKeywordsNode();
  }

  factor(): TreeNode {
    const token = this.currentToken;

    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
      return new NumNode(token); 
    } else if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS);
      const node = new UnaryNode(token, this.factor()); 
      return node;
    } else if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      const node = new UnaryNode(token, this.factor()); 
      return node;
    } else if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const node = this.expr();
      this.eat(TokenType.RPAREN);
      return node;
    } else if (token.type === TokenType.INTEGER_NUM) {
      this.eat(TokenType.INTEGER_NUM);
      return new NumNode(token);
    } else if (token.type === TokenType.REAL) {
      this.eat(TokenType.REAL);
      return new NumNode(token);
    } else {
      const node = this.variable();
      return node;
    }
  }

  term(): TreeNode {
    let node = this.factor();
    const priorityTypes = [
      TokenType.DIV, 
      TokenType.MULT, 
      TokenType.INTEGER_DIV, 
      TokenType.EQUALS,
      TokenType.NOT_EQUALS,
      TokenType.GT,
      TokenType.GTE,
      TokenType.LT,
      TokenType.LTE,
    ];

    while (priorityTypes.includes(this.currentToken.type)) {
      const token = this.currentToken;
      this.eat(token.type);
      node = new BinNode(token, node, this.factor());
    }

    return node;
  }

  expr(): TreeNode {
    let node = this.term();
    const termTypes = [TokenType.PLUS, TokenType.MINUS];

    while (termTypes.includes(this.currentToken.type)) {
      const token = this.currentToken;
      this.eat(token.type);
      node = new BinNode(token, node, this.term()); 
    }

    return node;
  }

  parse(): TreeNode {
    const node = this.program();
    return node;
  }
}