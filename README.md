# FractionTS

An immutable TypeScript class representing a rational number as a numerator/denominator pair of safe integers.

## Design

- The denominator is always normalised to a positive integer at construction time. Negative fractions are represented by a negative numerator.
- All operations return new `Fraction` instances — no method mutates state.
- Inputs are validated eagerly; errors are thrown immediately rather than propagating silently.

## Using in a JavaScript project

### 1. Compile

```sh
npm run build
```

This runs `tsc` and emits compiled `.mjs` files and `.d.ts` type declarations to `./dist`.

### 2. Import in JavaScript

```js
import { Fraction } from './dist/Fraction.mjs'

const half = new Fraction(1, 2)
console.log(half.toString())   // '1 / 2'
console.log(half.toNumber())   // 0.5
```

Requires Node.js 14.8+ with `"type": "module"` in your project's `package.json`, or a bundler that supports ES modules.

---

## Construction

```ts
new Fraction(numerator: number, denominator: number)
```

Both arguments must be safe integers (`Number.isSafeInteger`). The denominator must be non-zero.

```ts
new Fraction(1, 2)    // 1/2
new Fraction(-3, 4)   // -3/4
new Fraction(3, -4)   // normalised to -3/4
```

### Static constant

```ts
Fraction.Zero  // 0/1 — prefer this over new Fraction(0, 1)
```

## Instance methods

| Method | Returns | Description |
|---|---|---|
| `toString()` | `string` | `'{n} / {d}'`, e.g. `'-8 / 4'` |
| `toNumber()` | `number` | Floating-point value of `n / d` |
| `toInteger()` | `number` | Integer part, truncated toward zero |
| `valueOf()` | `number` | Enables implicit numeric coercion (see below) |

### `valueOf()`

Allows a `Fraction` to be used directly in numeric expressions:

```ts
const half = new Fraction(1, 2)
half + 1        // 1.5  — result is a number, not a Fraction
half * 4        // 2
half > 0.25     // true
```

**The result of any such expression is a `number`, not a `Fraction`.** To return to exact rational arithmetic, construct a new `Fraction` from the result at a precision you choose:

```ts
const result = half + new Fraction(1, 3)  // 0.8333333333333333 (number)
const exact  = Fraction.add(half, new Fraction(1, 3))  // Fraction(5, 6)
```

### `remainder` (getter)

```ts
fraction.remainder  // new Fraction(n % d, d)
```

Returns the fractional part after removing the integer portion.

```ts
new Fraction(7, 2).remainder  // Fraction(1, 2)  →  0.5
```

## Static methods

### `Fraction.add(a, b)`

Returns a new `Fraction` equal to the sum of two fractions.

$$\frac{a}{b} + \frac{c}{d} = \frac{a \cdot d + c \cdot b}{b \cdot d}$$

```ts
Fraction.add(new Fraction(1, 4), new Fraction(1, 4))  // Fraction(2, 4)  →  0.5
Fraction.add(new Fraction(1, 3), new Fraction(1, 6))  // Fraction(9, 18) →  0.5
```

Throws `InvalidIntegerError` if any intermediate value overflows safe integer range. Use `Fraction.reduce()` on inputs beforehand if overflow is a concern.

### `Fraction.addScalar(fraction, scalar)`

Returns a new `Fraction` equal to the fraction plus an integer.

$$\frac{a}{b} + n = \frac{a + n \cdot b}{b}$$

```ts
Fraction.addScalar(new Fraction(1, 4), 1)   // Fraction(5, 4)  →  1.25
Fraction.addScalar(new Fraction(1, 4), -1)  // Fraction(-3, 4) → -0.75
```

Throws `InvalidIntegerError` if `scalar` is not a safe integer or if the result overflows. Floats must be converted to a fraction of the desired precision before use.

### `Fraction.from(other)`

Creates a copy of an existing `Fraction`.

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

## Errors

Both error classes extend `RangeError` and are exported from `Errors.mts`.

| Error | Thrown when |
|---|---|
| `DivideByZeroError` | Denominator or scalar is zero |
| `InvalidIntegerError` | Any argument is not a safe integer, or a result overflows |

```ts
import { DivideByZeroError, InvalidIntegerError } from './Errors.mts'

try {
    new Fraction(1, 0)
} catch (e) {
    if (e instanceof DivideByZeroError) { /* ... */ }
}
```

## Precision note

This class operates on JavaScript's `number` type. Inputs and results are validated against `Number.isSafeInteger` (i.e. values within $\pm(2^{53} - 1)$), but intermediate floating-point arithmetic in `toNumber()` is subject to standard IEEE 754 rounding. For exact rational arithmetic, reduce fractions before converting to a float.
