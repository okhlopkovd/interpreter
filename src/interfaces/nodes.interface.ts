import { Memory } from './../classes/memory.class';
import { TokenType } from './../enums/token-type.enum';
import { Token } from './token.interface';

export interface TreeNode {
  evaluate(): any;
}

export class NumNode implements TreeNode {

  constructor (private token: Token) {}

  evaluate() {
    return this.token.value;
  }
}

export class BinNode implements TreeNode {

  constructor (private token: Token, 
               private left: TreeNode, 
               private right: TreeNode) {}

  evaluate() {
    const leftEval = this.left.evaluate();
    const rightEval = this.right.evaluate();

    switch (this.token.type) {
      case TokenType.PLUS:
        return leftEval + rightEval;
      case TokenType.MINUS:
        return leftEval - rightEval;
      case TokenType.DIV:
        return leftEval / rightEval;
      case TokenType.MULT:
        return leftEval * rightEval;
      case TokenType.INTEGER_DIV:
        return Math.floor(leftEval / rightEval);
      case TokenType.EQUALS:
        return leftEval === rightEval;
      case TokenType.NOT_EQUALS:
        return leftEval !== rightEval;
      case TokenType.GT:
        return leftEval > rightEval;
      case TokenType.GTE:
        return leftEval >= rightEval;
      case TokenType.LT:
        return leftEval < rightEval;
      case TokenType.LTE:
        return leftEval <= rightEval;
    }
  }
}

export class UnaryNode implements TreeNode {

  constructor (private token: Token, private node: TreeNode) {}

  evaluate() {
    if (this.token.type === TokenType.MINUS) {
      return -this.node.evaluate();
    }

    return +this.node.evaluate();
  }
}

export class CompoundNode implements TreeNode {

  constructor (private children: TreeNode[]) {}

  evaluate() {
    this.children.forEach(child => child.evaluate());
  }
}

export class VarNode implements TreeNode {

  constructor (private token: Token) {}

  evaluate() {
    const varName = this.token.value;
    const value = Memory.getMemory().getValue(varName);

    if (value) {
      return value;
    }

    throw new Error('Var does not exist');
  }
}

export class AssignNode implements TreeNode {

  constructor(private left: Token, private right: TreeNode) {}

  evaluate() {
    const varName = this.left.value;
    const value = this.right.evaluate();
    Memory.getMemory().setValue(varName, value);
  }
}

export class ReservedKeywordsNode implements TreeNode {
  evaluate() {}
}

export class ProgramNode implements TreeNode {

  constructor (private name: string, private block: TreeNode) {}

  evaluate() {
    this.block.evaluate();
  }
}

export class BlockNode implements TreeNode {

  constructor (private declarations: TreeNode[], private compound: TreeNode) {}

  evaluate() {
    this.declarations.forEach(declaration => declaration.evaluate());
    this.compound.evaluate();
  }
}

export class VarDeclarationNode implements TreeNode {

  constructor (private varNode: TreeNode, private typeNode: TreeNode) {}

  evaluate() {}
}

export class TypeNode implements TreeNode {

  constructor (private token: Token) {}

  evaluate() {}
}

export class IfElseNode implements TreeNode {

  constructor (private statement: TreeNode, private ifBlock: TreeNode, private elseBlock?: TreeNode) {}

  evaluate() {
    if (this.statement.evaluate()) {
      this.ifBlock.evaluate();
    } else if (this.elseBlock) {
      this.elseBlock.evaluate();
    }
  }
}