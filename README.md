# FractionTS

An immutable TypeScript class representing a rational number as a numerator/denominator pair of safe integers.

## Design

- The denominator is always normalised to a positive integer at construction time. Negative fractions are represented by a negative numerator.
- All operations return new `Fraction` instances — no method mutates state.
- All operations are available as both static methods and instance methods. The static form (`Fraction.addFraction(a, b)`) makes it visually unambiguous that a new value is produced. The instance form (`a.add(b)`) supports fluent chaining for multi-step calculations. The four arithmetic instance methods (`add`, `subtract`, `multiply`, `divide`) each accept either a `Fraction` or a plain integer and dispatch to the appropriate static method. All other instance methods are one-line delegates to their static counterparts — the static methods are the single source of truth.
- All arithmetic operations accept an optional `reduce` flag. When `true`, the result is automatically reduced to lowest terms — equivalent to chaining `.reduce()` on the result.
- Inputs are validated eagerly; errors are thrown immediately rather than propagating silently.

## Using in a JavaScript project

### 1. Compile

```sh
npm run build
```

This runs `tsc` and emits compiled `.mjs` files and `.d.ts` type declarations to `./dist`.

### 2. Import in JavaScript

```js
import Fraction from './dist/Fraction.mjs'

const half = new Fraction(1, 2)
console.log(half.toString())   // '1 / 2'
console.log(half.toNumber())   // 0.5
```

Requires Node.js 14.8+ with `"type": "module"` in your project's `package.json`, or a bundler that supports ES modules.

## Using in a CommonJS project

`require()` cannot load `.mjs` files. The only native option in a CJS project is dynamic `import()`, which is asynchronous.

Import only what you need. The error classes are optional — only include them if you intend to catch and identify them by type:

```js
// Fraction only
const { default: Fraction } = await import('./path/to/dist/Fraction.mjs')

// Fraction + error classes (for instanceof checks in try/catch)
const { default: Fraction, DivideByZeroError, InvalidIntegerError } = await import('./path/to/dist/Fraction.mjs')
```

Full example:

```js
// CommonJS project (.js without "type": "module")
async function main() {
    const { default: Fraction, DivideByZeroError } = await import('./path/to/dist/Fraction.mjs')

    const half = new Fraction(1, 2)
    console.log(half.toString())  // '1 / 2'

    try {
        new Fraction(1, 0)
    } catch (e) {
        if (e instanceof DivideByZeroError) console.log('caught:', e.message)
    }
}

main()
```

Dynamic `import()` returns a Promise, so all code that uses `Fraction` must live inside an `async` function or a `.then()` chain. Top-level `await` is not available in CJS modules.

If the async wrapping is impractical, the alternative is to use a bundler such as [esbuild](https://esbuild.github.io/) or [Webpack](https://webpack.js.org/) to convert the ESM output to CJS format before distributing or consuming it.

---

## Constructor

```ts
new Fraction(numerator: number, denominator?: number = 1, reduce?: boolean = false)
```

Both `numerator` and `denominator` must be safe integers (`Number.isSafeInteger`). The denominator must be non-zero and defaults to `1`. If `reduce` is `true`, the returned instance is automatically reduced to lowest terms.

```ts
new Fraction(1, 2)          // 1/2
new Fraction(-3, 4)         // -3/4
new Fraction(3, -4)         // normalised to -3/4
new Fraction(4, 8, true)    // reduced to 1/2
```

### Static constant

```ts
Fraction.Zero  // 0/1 — prefer this over new Fraction(0, 1)
```

## Instance methods

### Conversion

| Method | Returns | Description |
|---|---|---|
| `toString()` | `string` | `'{n} / {d}'`, e.g. `'-8 / 4'` |
| `toNumber()` | `number` | Floating-point value of `n / d` |
| `toInteger()` | `number` | Integer part, truncated toward zero |
| `valueOf()` | `number` | Enables implicit numeric coercion (see below) |
| `remainder` | `Fraction` | Fractional part after removing the integer portion |
| `equals(other)` | `boolean` | `true` if this fraction equals `other` after reduction |

### Chainable arithmetic

The four arithmetic instance methods each accept either a `Fraction` or a plain integer, dispatching to the appropriate static method automatically. All other instance methods delegate directly to their static counterparts:

| Method | `Fraction` argument | `number` argument |
|---|---|---|
| `add(value, reduce?)` | `Fraction.addFraction(this, value, reduce)` | `Fraction.addScalar(this, value, reduce)` |
| `subtract(value, reduce?)` | `Fraction.subtractFraction(this, value, reduce)` | `Fraction.subtractScalar(this, value, reduce)` |
| `multiply(value, reduce?)` | `Fraction.multiplyFraction(this, value, reduce)` | `Fraction.multiplyScalar(this, value, reduce)` |
| `divide(value, reduce?)` | `Fraction.divideFraction(this, value, reduce)` | `Fraction.divideScalar(this, value, reduce)` |

| Method | Delegates to |
|---|---|
| `negate()` | `Fraction.negate(this)` |
| `reciprocal()` | `Fraction.reciprocal(this)` |
| `reduce()` | `Fraction.reduce(this)` |
| `expand(scalar)` | `Fraction.expand(this, scalar)` |
| `equals(other)` | `Fraction.equals(this, other)` |

```ts
// Static form — clear that a new value is produced
const result = Fraction.reduce(Fraction.addFraction(Fraction.multiplyFraction(a, b), c))

// Instance form — left-to-right, chainable
const result = a.multiply(b).add(c).reduce()
```

### `valueOf()`

Allows a `Fraction` to be used directly in numeric expressions in JavaScript. TypeScript requires an explicit `Number()` cast with the `+` operator:

```ts
const half = new Fraction(1, 2)
Number(half) + 1   // 1.5  — result is a number, not a Fraction
half * 4           // 2
half > 0.25        // true
```

**The result of any such expression is a `number`, not a `Fraction`.** For exact rational arithmetic, use the static methods instead:

```ts
const result = Number(half) + Number(new Fraction(1, 3))  // 0.8333333333333333 (number)
const exact  = Fraction.addFraction(half, new Fraction(1, 3))     // Fraction(5, 6)
```

### `remainder` (getter)

```ts
fraction.remainder  // new Fraction(n % d, d)
```

Returns the fractional part after removing the integer portion.

```ts
new Fraction(7, 2).remainder          // Fraction(1, 2)  →  0.5
new Fraction(7, 2).remainder.reduce() // chaining works here too
```

## Static methods

### `Fraction.addFraction(a, b, reduce?)`

Returns a new `Fraction` equal to the sum of two fractions. Finds the LCM of the denominators and scales each numerator before adding, so the result denominator is always the LCM — not the product:

$$\frac{a}{b} + \frac{c}{d} = \frac{a \cdot \frac{\text{lcm}}{b} + c \cdot \frac{\text{lcm}}{d}}{\text{lcm}}, \quad \text{lcm} = \frac{b \cdot d}{\gcd(b,d)}$$

```ts
Fraction.addFraction(new Fraction(1, 4), new Fraction(1, 4))  // Fraction(2, 4)  →  0.5
Fraction.addFraction(new Fraction(1, 3), new Fraction(1, 6))  // Fraction(3, 6)  →  0.5
```

Throws `InvalidIntegerError` if any intermediate value overflows safe integer range. Use `Fraction.reduce()` on inputs beforehand if overflow is a concern; passing `reduce: true` reduces the *result* but does not reduce inputs before the operation.

### `Fraction.addScalar(fraction, scalar, reduce?)`

Returns a new `Fraction` equal to the fraction plus an integer.

$$\frac{a}{b} + n = \frac{a + n \cdot b}{b}$$

```ts
Fraction.addScalar(new Fraction(1, 4), 1)   // Fraction(5, 4)  →  1.25
Fraction.addScalar(new Fraction(1, 4), -1)  // Fraction(-3, 4) → -0.75
```

Throws `InvalidIntegerError` if `scalar` is not a safe integer or if the result overflows. Floats must be converted to a fraction of the desired precision before use.

### `Fraction.subtractFraction(a, b, reduce?)`

Returns a new `Fraction` equal to the difference of two fractions. Negates `b` and delegates to `Fraction.addFraction`.

$$\frac{a}{b} - \frac{c}{d} = \frac{a}{b} + \left(-\frac{c}{d}\right)$$

```ts
Fraction.subtractFraction(new Fraction(3, 4), new Fraction(1, 4))  // Fraction(2, 4)  →  0.5
Fraction.subtractFraction(new Fraction(1, 4), new Fraction(3, 4))  // Fraction(-2, 4) → -0.5
```

Throws `InvalidIntegerError` if any intermediate value overflows safe integer range.

### `Fraction.subtractScalar(fraction, scalar, reduce?)`

Returns a new `Fraction` equal to the fraction minus an integer. Negates `scalar` and delegates to `Fraction.addScalar`.

```ts
Fraction.subtractScalar(new Fraction(5, 4), 1)   // Fraction(1, 4)  →  0.25
Fraction.subtractScalar(new Fraction(1, 4), -1)  // Fraction(5, 4)  →  1.25
```

Throws `InvalidIntegerError` if `scalar` is not a safe integer or if the result overflows.

### `Fraction.multiplyFraction(a, b, reduce?)`

Returns a new `Fraction` equal to the product of two fractions.

$$\frac{a}{b} \cdot \frac{c}{d} = \frac{a \cdot c}{b \cdot d}$$

```ts
Fraction.multiplyFraction(new Fraction(2, 3), new Fraction(3, 4))  // Fraction(6, 12) → 0.5
```

Throws `InvalidIntegerError` if any intermediate value overflows safe integer range.

### `Fraction.multiplyScalar(fraction, scalar, reduce?)`

Returns a new `Fraction` with the numerator scaled by an integer. The denominator is unchanged.

$$\frac{a}{b} \cdot n = \frac{a \cdot n}{b}$$

```ts
Fraction.multiplyScalar(new Fraction(1, 4), 3)   // Fraction(3, 4)  → 0.75
Fraction.multiplyScalar(new Fraction(1, 4), -1)  // Fraction(-1, 4) → -0.25
```

Returns `Fraction.Zero` immediately if `scalar` is zero without calling the constructor. Throws `InvalidIntegerError` if `scalar` is not a safe integer or if the result overflows.

### `Fraction.divideFraction(a, b, reduce?)`

Returns a new `Fraction` equal to `a` divided by `b`. Takes the reciprocal of `b` and delegates to `Fraction.multiplyFraction`.

$$\frac{a}{b} \div \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c}$$

```ts
Fraction.divideFraction(new Fraction(1, 2), new Fraction(3, 4))  // Fraction(4, 6) → 0.667
```

Throws `DivideByZeroError` if the numerator of `b` is zero.

### `Fraction.divideScalar(fraction, scalar, reduce?)`

Returns a new `Fraction` divided by an integer. Constructs `1/scalar` and delegates to `Fraction.multiplyFraction`.

```ts
Fraction.divideScalar(new Fraction(3, 4), 3)   // Fraction(3, 12) → 0.25
Fraction.divideScalar(new Fraction(3, 4), -1)  // Fraction(-3, 4) → -0.75
```

Throws `DivideByZeroError` if `scalar` is zero. Throws `InvalidIntegerError` if `scalar` is not a safe integer.

### `Fraction.from(other)`

Creates a defensive copy of an existing `Fraction`. Although `Fraction` is immutable, this is useful when a variable needs to be rebound to a logically independent instance rather than sharing a reference to the same object — for example, when storing a snapshot of a value that may later be replaced by a different `Fraction`.

```ts
let a = new Fraction(1, 2)
let snapshot = Fraction.from(a)  // independent copy
a = Fraction.addFraction(a, new Fraction(1, 4))  // rebind a; snapshot is unaffected
```

### `Fraction.negate(other)`

Returns a new `Fraction` with the sign flipped.

```ts
Fraction.negate(new Fraction(3, 4))  // Fraction(-3, 4)
```

### `Fraction.reciprocal(other)`

Returns `1 / other` by swapping numerator and denominator.

```ts
Fraction.reciprocal(new Fraction(3, 4))  // Fraction(4, 3)
```

Throws `DivideByZeroError` if the numerator is zero.

### `Fraction.reduce(fraction)`

Returns an equivalent `Fraction` in lowest terms by dividing both terms by their GCD.

```ts
Fraction.reduce(new Fraction(4, 8))  // Fraction(1, 2)
```

### `Fraction.expand(fraction, scalar)`

Returns an equivalent `Fraction` with both terms multiplied by `scalar`. The mathematical value is unchanged.

```ts
Fraction.expand(new Fraction(1, 2), 3)  // Fraction(3, 6)
```

Throws `DivideByZeroError` if `scalar` is zero. Throws `InvalidIntegerError` if the result overflows safe integer range.

### `Fraction.equals(a, b)`

Returns `true` if two `Fraction` instances represent the same rational value. Both fractions are reduced before comparison, so `1/2` and `2/4` are considered equal.

```ts
Fraction.equals(new Fraction(1, 2), new Fraction(2, 4))  // true
Fraction.equals(new Fraction(1, 2), new Fraction(3, 4))  // false

// Instance form
new Fraction(1, 2).equals(new Fraction(2, 4))  // true
```

## Errors

Both error classes extend `RangeError`. They are defined in `Errors.mts` and re-exported from `Fraction.mts`, so a single import covers everything:

| Error | Thrown when |
|---|---|
| `DivideByZeroError` | Denominator or scalar is zero |
| `InvalidIntegerError` | Any argument is not a safe integer, or a result overflows |

```ts
// Preferred — one import for everything
import Fraction, { DivideByZeroError, InvalidIntegerError } from './Fraction.mts'

// Also valid — import from the source file directly
import { DivideByZeroError, InvalidIntegerError } from './Errors.mts'

try {
    new Fraction(1, 0)
} catch (e) {
    if (e instanceof DivideByZeroError) { /* ... */ }
}
```

---

## Precision note

This class operates on JavaScript's `number` type. Inputs and results are validated against `Number.isSafeInteger` (i.e. values within $\pm(2^{53} - 1)$), but intermediate floating-point arithmetic in `toNumber()` is subject to standard IEEE 754 rounding. If the rational value cannot be represented exactly in floating-point (e.g. `1/3`), the result of `toNumber()` or `valueOf()` will be an approximation regardless of whether the fraction is in lowest terms.


## Tools and Acknowledgement

- Author @jauntyjocularjay
    - Planning
    - Setup
    - Copilot Generated Code Review
    - Constructor
    - Custom Errors
    - Validation Methods
    - Expand Method

- GitHub Copilot via VSCode
    - Documentation
    - Test Suite
    - Mathematical Operations
    - Reduce Algorithm