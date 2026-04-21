# Rule Composite Pattern

This module implements the **Composite Design Pattern** for managing portfolio switching rules. This pattern allows building complex rule expressions while keeping the code maintainable and extensible.

## Design Pattern Overview

The Composite pattern treats individual rules and groups of rules uniformly, allowing you to:
- Build complex rule expressions from simple components
- Add/remove rules dynamically
- Combine rules with logical operators (AND/OR)
- Evaluate expressions recursively

## Architecture

```
RuleComponent (Interface)
├── RuleLeaf (Single Rule)
└── RuleComposite (Group of Rules with Operator)
```

### Components

#### `RuleComponent` (Interface)
The base interface that all rule components implement:
```typescript
interface RuleComponent {
    evaluate(): string;
    getType(): 'leaf' | 'composite';
    getChildren?(): RuleComponent[];
}
```

#### `RuleLeaf`
Represents a single, atomic switching rule:
```typescript
const leaf = new RuleLeaf(rule, "Rule1");
leaf.evaluate(); // Returns: "Rule1"
```

#### `RuleComposite`
Represents a composition of rules with a logical operator:
```typescript
const composite = new RuleComposite('AND');
composite.add(new RuleLeaf(rule1, "Rule1"));
composite.add(new RuleLeaf(rule2, "Rule2"));
composite.evaluate(); // Returns: "Rule1 AND Rule2"
```

## Usage

### Building Rule Expressions

Use `RuleExpressionBuilder` for a fluent API:

```typescript
const builder = new RuleExpressionBuilder();

// Build: Rule1 OR Rule2 OR Rule3
builder
    .addRule(rule1, "Rule1")
    .addRule(rule2, "Rule2")
    .addRule(rule3, "Rule3")
    .setOperator('OR');

const expression = builder.getExpression();
// Result: "Rule1 OR Rule2 OR Rule3"
```

### Parsing Existing Expressions

Convert string expressions back to composite structures:

```typescript
const composite = RuleExpressionParser.parse(
    "Rule1 AND Rule2",
    availableRules
);

if (composite) {
    console.log(composite.evaluate()); // "Rule1 AND Rule2"
}
```

## UI Components

### `RuleCard`
Displays a single rule with add buttons for chain building.

**Props:**
- `rule`: The switching rule data
- `ruleName`: Display name
- `isInChain`: Whether already added to expression
- `isChainEmpty`: Whether the chain is empty
- `onAdd`: Callback when adding rule with operator

### `RuleChainDisplay`
Displays the current rule expression with interactive controls.

**Props:**
- `ruleNames`: Array of rule names in the chain
- `operators`: Array of logical operators between rules
- `expression`: The evaluated expression string
- `onRemove`: Callback to remove a rule
- `onOperatorChange`: Callback to change an operator

## Benefits of This Pattern

1. **Single Responsibility**: Each component has one job
2. **Open/Closed**: Easy to extend with new rule types without modifying existing code
3. **Composability**: Build complex expressions from simple parts
4. **Maintainability**: Clear separation of concerns
5. **Testability**: Each component can be tested independently
6. **Type Safety**: Full TypeScript support with interfaces

## Future Enhancements

- Support for nested expressions with parentheses
- NOT operator support
- Visual tree representation
- Rule validation before evaluation
- Expression optimization (e.g., removing redundant rules)
- Undo/redo functionality
- Export/import rule expressions

## Example Usage in Modal

```typescript
const [builder] = useState(() => new RuleExpressionBuilder());
const [ruleNames, setRuleNames] = useState<string[]>([]);

const addRuleToChain = (ruleName: string, operator: LogicalOperator = 'OR') => {
    const rule = availableRules.find(r => r.name === ruleName);
    if (rule) {
        builder.addRule(rule, ruleName);
        setRuleNames([...ruleNames, ruleName]);
    }
};

const handleAssign = () => {
    const expression = builder.getExpression();
    onAssign(expression);
};
```

## Testing Strategy

1. **Unit Tests**: Test each component in isolation
   - RuleLeaf evaluation
   - RuleComposite add/remove/evaluate
   - RuleExpressionBuilder fluent API

2. **Integration Tests**: Test component interactions
   - Building complex expressions
   - Parsing and rebuilding
   - UI component interactions

3. **E2E Tests**: Test full user workflows
   - Adding rules to chain
   - Changing operators
   - Removing rules
   - Assigning expressions
