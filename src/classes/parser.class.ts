import { UnaryNode, ReservedKeywordsNode, VarNode, AssignNode, CompoundNode, BlockNode, VarDeclarationNode, TypeNode, ProgramNode, IfElseNode, WhileNode, ForNode } from './../interfaces/nodes.interface';
import { BinNode, NumNode, TreeNode } from '../interfaces/nodes.interface';
import { TokenType } from '../enums/token-type.enum';
import { Lexer } from './lexer.class';

export class Parser { 

  private currentToken = this.lexer.getNextToken();

  constructor(private lexer: Lexer) {}

  eat(type: TokenType): void {
    if (this.currentToken.type === type) {
      this.currentToken = this.lexer.getNextToken();
      return;
    }

    throw new Error('Error parsing input in eat');
  }

  program(): TreeNode {
    this.eat(TokenType.PROGRAM);
    this.variable();
    this.eat(TokenType.SEMICOLON);
    const block = this.block();
    return new ProgramNode(block);
  }

  block(): BlockNode {
    return new BlockNode(this.declarations(), this.compoundStatement());
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

    token.type === TokenType.INTEGER_NUM 
      ? this.eat(TokenType.INTEGER_NUM)
      : this.eat(TokenType.REAL);

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

  compoundStatement(): CompoundNode {
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
    return new WhileNode(this.term(), this.compoundStatement());
  }

  forStatement(): TreeNode {
    this.eat(TokenType.FOR);
    const declarationStatement = this.assignmentStatement();

    this.eat(TokenType.SEMICOLON);
    const conditionalStatement = this.term();

    this.eat(TokenType.SEMICOLON);
    const incrementStatement = this.assignmentStatement();
    const forBlock = this.compoundStatement();

    return new ForNode(
      declarationStatement, 
      conditionalStatement, 
      incrementStatement, 
      forBlock
    );
  }

  statement(): TreeNode {
    const typeToMap: { [key: string]: () => TreeNode } = {
      [TokenType.BEGIN]: this.compoundStatement.bind(this),
      [TokenType.ID]: this.assignmentStatement.bind(this),
      [TokenType.IF]: this.ifElseStatement.bind(this),
      [TokenType.WHILE]: this.whileStatement.bind(this),
      [TokenType.FOR]: this.forStatement.bind(this),
    };

    if (typeToMap[this.currentToken.type]) {
      return typeToMap[this.currentToken.type]();
    }

    return this.empty();
  }

  assignmentStatement(): AssignNode {
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

    switch (token.type) {
      case TokenType.INTEGER:
        this.eat(TokenType.INTEGER);
        return new NumNode(token);
      case TokenType.PLUS:
        this.eat(TokenType.PLUS);
        return new UnaryNode(token, this.factor());
      case TokenType.MINUS:
        this.eat(TokenType.MINUS);
        return new UnaryNode(token, this.factor());
      case TokenType.LPAREN:
        this.eat(TokenType.LPAREN);
        const node = this.expr();
        this.eat(TokenType.RPAREN);
        return node;
      case TokenType.INTEGER_NUM:
        this.eat(TokenType.INTEGER_NUM);
        return new NumNode(token);
      case TokenType.REAL:
        this.eat(TokenType.REAL);
        return new NumNode(token);
      default:
        return this.variable();
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
    return this.program();
  }
}