import { SwitchingRule } from '../../../types/strategy';

/**
 * Composite Design Pattern for Rule Expressions
 * Allows building complex rule trees with AND/OR operators
 */

export type LogicalOperator = 'AND' | 'OR';

export interface RuleComponent {
    evaluate(): string;
    getType(): 'leaf' | 'composite';
    getChildren?(): RuleComponent[];
}

/**
 * Leaf Node - represents a single rule
 */
export class RuleLeaf implements RuleComponent {
    constructor(
        public readonly rule: SwitchingRule,
        public readonly name: string
    ) { }

    evaluate(): string {
        return this.name;
    }

    getType(): 'leaf' {
        return 'leaf';
    }

    getRule(): SwitchingRule {
        return this.rule;
    }
}

/**
 * Composite Node - represents a combination of rules with an operator
 */
export class RuleComposite implements RuleComponent {
    private children: RuleComponent[] = [];

    constructor(private operator: LogicalOperator) { }

    add(component: RuleComponent): void {
        this.children.push(component);
    }

    remove(index: number): void {
        this.children.splice(index, 1);
    }

    getChildren(): RuleComponent[] {
        return this.children;
    }

    getOperator(): LogicalOperator {
        return this.operator;
    }

    setOperator(operator: LogicalOperator): void {
        this.operator = operator;
    }

    evaluate(): string {
        if (this.children.length === 0) return '';
        if (this.children.length === 1) return this.children[0].evaluate();

        return this.children
            .map(child => child.evaluate())
            .join(` ${this.operator} `);
    }

    getType(): 'composite' {
        return 'composite';
    }

    isEmpty(): boolean {
        return this.children.length === 0;
    }
}

/**
 * Builder for creating rule expressions
 */
export class RuleExpressionBuilder {
    private root: RuleComposite;

    constructor(operator: LogicalOperator = 'OR') {
        this.root = new RuleComposite(operator);
    }

    addRule(rule: SwitchingRule, name: string): this {
        this.root.add(new RuleLeaf(rule, name));
        return this;
    }

    addComposite(composite: RuleComposite): this {
        this.root.add(composite);
        return this;
    }

    setOperator(operator: LogicalOperator): this {
        this.root.setOperator(operator);
        return this;
    }

    build(): RuleComposite {
        return this.root;
    }

    getExpression(): string {
        return this.root.evaluate();
    }

    isEmpty(): boolean {
        return this.root.isEmpty();
    }

    clear(): void {
        this.root = new RuleComposite(this.root.getOperator());
    }
}

/**
 * Helper to parse existing rule expressions back into components
 */
export class RuleExpressionParser {
    static parse(
        expression: string,
        availableRules: SwitchingRule[]
    ): RuleComposite | null {
        if (!expression.trim()) return null;

        const ruleMap = new Map<string, SwitchingRule>();
        availableRules.forEach(rule => {
            const name = rule.name || '';
            if (name) ruleMap.set(name, rule);
        });

        // Simple parser for "Rule1 AND Rule2 OR Rule3" format
        const tokens = expression.split(/\s+(AND|OR)\s+/);
        const composite = new RuleComposite('OR');

        for (let i = 0; i < tokens.length; i += 2) {
            const ruleName = tokens[i].trim();
            const rule = ruleMap.get(ruleName);

            if (rule) {
                composite.add(new RuleLeaf(rule, ruleName));
            }

            // Set operator from next token if exists
            if (i + 1 < tokens.length) {
                const operator = tokens[i + 1] as LogicalOperator;
                composite.setOperator(operator);
            }
        }

        return composite.isEmpty() ? null : composite;
    }
}
