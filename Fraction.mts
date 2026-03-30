import { InvalidIntegerError, DivideByZeroError } from './Errors.mjs'

export { InvalidIntegerError, DivideByZeroError }

export default class Fraction {
    /** The numerator. Negative values represent a negative fraction. */
    private readonly n: number

    /** The denominator. Always a positive integer after construction. */
    private readonly d: number

    /**
     * The additive identity of the {@link Fraction} type, representing 0/1.
     * Prefer this over `new Fraction(0, 1)` to avoid unnecessary allocations.
     */
    static readonly Zero: Fraction = new Fraction(0, 1)

    /**
     * @param numerator - Must be a safe integer. Will be negated if `denominator` is negative.
     * @param denominator - Must be a non-zero safe integer. Negative values will be normalised. If not provided, defaults to 1
     * @throws {DivideByZeroError} If `denominator` is zero.
     * @throws {InvalidIntegerError} If either argument is not a safe integer.
     */
    constructor(numerator: number, denominator: number = 1) {
        let temp_numerator = numerator
        let temp_denominator = denominator

        if (denominator < 0) {
            temp_numerator = -numerator
            temp_denominator = -denominator
        }

        Fraction.ValidateFraction(temp_numerator, temp_denominator)

        this.n = temp_numerator
        this.d = temp_denominator
    }

    /**
     * Returns a string representation in the form `'n / d'`.
     * @returns A string formatted as `'{numerator} / {denominator}'`.
     * @example new Fraction(-8, 4).toString() // '-8 / 4'
     */
    toString(): string {
        return `${this.n} / ${this.d}`
    }

    /**
     * Returns the fraction as a floating-point number.
     * @returns The result of dividing the numerator by the denominator.
     */
    toNumber(): number {
        return this.n / this.d
    }

    /**
     * Enables implicit numeric coercion so that a {@link Fraction} can be used
     * directly in JavaScript arithmetic expressions.
     * The result of any such expression is a `number`, not a {@link Fraction}.
     * IEEE 754 rounding applies — the result is an approximation if the rational
     * value cannot be represented exactly in floating-point.
     * @returns The floating-point value of `n / d`.
     * @example
     * const half = new Fraction(1, 2)
     * Number(half) + 1   // 1.5  (number)
     * Number(half) > 0   // true (boolean)
     */
    valueOf(): number {
        return this.toNumber()
    }

    /**
     * Returns `true` if this {@link Fraction} represents the same rational value
     * as `other`. Both fractions are reduced before comparison, so `1/2` and `2/4`
     * are considered equal.
     * @param other - The {@link Fraction} to compare against.
     * @returns `true` if the two fractions are equal in value.
     * @example new Fraction(1, 2).equals(new Fraction(2, 4)) // true
     */
    equals(other: Fraction): boolean {
        return Fraction.equals(this, other)
    }

    /**
     * Returns `true` if two {@link Fraction} instances represent the same rational
     * value. Both fractions are reduced before comparison, so `1/2` and `2/4`
     * are considered equal.
     * @param fraction_a - The first {@link Fraction}.
     * @param fraction_b - The second {@link Fraction}.
     * @returns `true` if `a` and `b` are equal in value.
     * @example Fraction.equals(new Fraction(1, 2), new Fraction(2, 4)) // true
     */
    static equals(a: Fraction, b: Fraction): boolean {
        const fraction_a = Fraction.reduce(a)
        const fraction_b = Fraction.reduce(b)
        return fraction_a.n === fraction_b.n && fraction_a.d === fraction_b.d
    }

    /**
     * Returns the integer part of the fraction, truncating toward zero.
     * @returns The truncated integer value of the fraction.
     * @example new Fraction(7, 2).toInteger()  // 3
     * @example new Fraction(-7, 2).toInteger() // -3
     */
    toInteger(): number {
        return Math.trunc(this.toNumber())
    }

    /**
     * Creates a defensive copy of an existing {@link Fraction}.
     * Although {@link Fraction} is immutable, this is useful when a variable needs
     * to be rebound to a logically independent instance rather than sharing a
     * reference to the same object — for example, when storing a snapshot of a
     * value that may later be replaced by a different {@link Fraction}.
     * @param other - The source {@link Fraction} to copy.
     * @returns A new {@link Fraction} with the same numerator and denominator as `other`.
     */
    static from(other: Fraction): Fraction {
        return new Fraction(other.n, other.d)
    }

    /**
     * Returns a new {@link Fraction} with the sign of the numerator flipped.
     * @param other - The {@link Fraction} to negate.
     * @returns A new {@link Fraction} equal to `-other`.
     */
    static negate(other: Fraction): Fraction {
        return new Fraction(-other.n, other.d)
    }

    /**
     * Returns a new {@link Fraction} equal to the sum of two fractions.
     * Finds the least common multiple (LCM) of the two denominators and scales
     * each numerator by its respective factor before adding:
     *   a/b + c/d = (a·(lcm/b) + c·(lcm/d)) / lcm, where lcm = lcm(b, d).
     * When denominators are equal the scale factors are both 1 (no multiplication).
     * When one denominator divides the other, only the smaller-denominator
     * fraction is scaled.
     * @param a - The first {@link Fraction}.
     * @param b - The second {@link Fraction}.
     * @returns A new {@link Fraction} representing `a + b`.
     * @throws {InvalidIntegerError} If any intermediate value overflows safe integer range.
     */
    static add(a: Fraction, b: Fraction): Fraction {
        const gcd = Fraction.GCD(a.d, b.d)
        const lcm = (a.d / gcd) * b.d
        const scaleA = lcm / a.d
        const scaleB = lcm / b.d
        const numerator = a.n * scaleA + b.n * scaleB
        return new Fraction(numerator, lcm)
    }

    /**
     * Returns a new {@link Fraction} equal to the fraction plus an integer.
     * Uses the identity: a/b + n = (a + n·b) / b.
     * @param fraction - The {@link Fraction} to add to.
     * @param scalar - A safe integer to add.
     * @returns A new {@link Fraction} representing `fraction + scalar`.
     * @throws {InvalidIntegerError} If the scalar is not a safe integer, or if any
     * intermediate value overflows safe integer range.
     */
    static addScalar(fraction: Fraction, scalar: number): Fraction {
        if (!Number.isSafeInteger(scalar)) throw new InvalidIntegerError(scalar)
        const numerator = fraction.n + scalar * fraction.d
        if (!Number.isSafeInteger(numerator))
            throw new InvalidIntegerError(numerator)
        return new Fraction(numerator, fraction.d)
    }

    /**
     * Returns a new {@link Fraction} equal to the difference of two fractions.
     * Negates `b` and delegates to {@link Fraction.add}.
     * @param a - The {@link Fraction} to subtract from.
     * @param b - The {@link Fraction} to subtract.
     * @returns A new {@link Fraction} representing `a - b`.
     * @throws {InvalidIntegerError} If any intermediate value overflows safe integer range.
     */
    static subtract(a: Fraction, b: Fraction): Fraction {
        return Fraction.add(a, Fraction.negate(b))
    }

    /**
     * Returns a new {@link Fraction} equal to the fraction minus an integer.
     * Negates `scalar` and delegates to {@link Fraction.addScalar}.
     * @param fraction - The {@link Fraction} to subtract from.
     * @param scalar - A safe integer to subtract.
     * @returns A new {@link Fraction} representing `fraction - scalar`.
     * @throws {InvalidIntegerError} If the scalar is not a safe integer, or if the
     * result overflows safe integer range.
     */
    static subtractScalar(fraction: Fraction, scalar: number): Fraction {
        return Fraction.addScalar(fraction, -scalar)
    }

    /**
     * Returns a new {@link Fraction} equal to the product of two fractions.
     * Uses the identity: (a/b) · (c/d) = (a·c) / (b·d).
     * @param a - The first {@link Fraction}.
     * @param b - The second {@link Fraction}.
     * @returns A new {@link Fraction} representing `a * b`.
     * @throws {InvalidIntegerError} If any intermediate value overflows safe integer range.
     */
    static multiply(a: Fraction, b: Fraction): Fraction {
        const numerator = a.n * b.n
        const denominator = a.d * b.d
        return new Fraction(numerator, denominator)
    }

    /**
     * Returns a new {@link Fraction} equal to the fraction multiplied by a scalar integer.
     * Only the numerator is scaled; the denominator is unchanged.
     * Uses the identity: (a/b) · n = (a·n) / b.
     * If `scalar` is zero, returns {@link Fraction.Zero} immediately without validation.
     * @param fraction - The {@link Fraction} to scale.
     * @param scalar - A safe integer to multiply by.
     * @returns A new {@link Fraction} representing `fraction * scalar`.
     * @throws {InvalidIntegerError} If `scalar` is not a safe integer, or if the
     * result overflows safe integer range.
     */
    static multiplyScalar(fraction: Fraction, scalar: number): Fraction {
        if(scalar === 0) return Fraction.Zero

        Fraction.ValidateScalar(scalar)
        const numerator = fraction.n * scalar
        if (!Number.isSafeInteger(numerator))
            throw new InvalidIntegerError(numerator)
        return new Fraction(numerator, fraction.d)
    }

    /**
     * Returns a new {@link Fraction} equal to `a` divided by `b`.
     * Takes the reciprocal of `b` and delegates to {@link Fraction.multiply}.
     * @param a - The dividend {@link Fraction}.
     * @param b - The divisor {@link Fraction}.
     * @returns A new {@link Fraction} representing `a / b`.
     * @throws {DivideByZeroError} If the numerator of `b` is zero.
     * @throws {InvalidIntegerError} If any intermediate value overflows safe integer range.
     */
    static divide(a: Fraction, b: Fraction): Fraction {
        return Fraction.multiply(a, Fraction.reciprocal(b))
    }

    /**
     * Returns a new {@link Fraction} equal to the fraction divided by a scalar integer.
     * Takes the reciprocal of `scalar` as a fraction and delegates to {@link Fraction.multiply}.
     * @param fraction - The {@link Fraction} to divide.
     * @param scalar - A non-zero safe integer to divide by.
     * @returns A new {@link Fraction} representing `fraction / scalar`.
     * @throws {DivideByZeroError} If `scalar` is zero.
     * @throws {InvalidIntegerError} If `scalar` is not a safe integer.
     */
    static divideScalar(fraction: Fraction, scalar: number): Fraction {
        Fraction.ValidateScalar(scalar)
        return Fraction.multiply(fraction, new Fraction(1, scalar))
    }

    /**
     * Returns the reciprocal of a {@link Fraction}, swapping numerator and denominator.
     * @param other - The {@link Fraction} to invert.
     * @returns A new {@link Fraction} equal to `1 / other`.
     * @throws {DivideByZeroError} If the numerator of `other` is zero.
     */
    static reciprocal(other: Fraction): Fraction {
        if (other.n === 0) throw new DivideByZeroError()
        return new Fraction(other.d, other.n)
    }

    /**
     * Returns a new {@link Fraction} reduced to lowest terms by dividing both
     * numerator and denominator by their GCD.
     * @param fraction - The {@link Fraction} to reduce.
     * @returns A new {@link Fraction} in lowest terms.
     * @example Fraction.reduce(new Fraction(4, 8)) // Fraction(1, 2)
     */
    static reduce(fraction: Fraction): Fraction {
        const gcd = Fraction.GCD(fraction.n, fraction.d)
        return new Fraction(fraction.n / gcd, fraction.d / gcd)
    }

    /**
     * Returns a new {@link Fraction} with numerator and denominator both multiplied
     * by `scalar`. The mathematical value is unchanged.
     * @param fraction - The {@link Fraction} to expand.
     * @param scalar - A non-zero safe integer to multiply by.
     * @returns A new {@link Fraction} equal in value to `fraction` with scaled terms.
     * @throws {DivideByZeroError} If `scalar` is zero.
     * @throws {InvalidIntegerError} If `scalar` is not a safe integer, or if the
     * result overflows safe integer range.
     */
    static expand(fraction: Fraction, scalar: number): Fraction {
        Fraction.ValidateScalar(scalar)
        const numerator = fraction.n * scalar
        const denominator = fraction.d * scalar
        return new Fraction(numerator, denominator)
    }

    /**
     * The fractional remainder after removing the integer part.
     * @returns A new {@link Fraction} representing `(n % d) / d`.
     * @example new Fraction(7, 2).remainder // Fraction(1, 2)
     */
    get remainder(): Fraction {
        return new Fraction(this.n % this.d, this.d)
    }

    // -------------------------------------------------------------------------
    // Instance wrappers (chainable API)
    // Each method delegates to its static counterpart with `this` as the first argument.
    // -------------------------------------------------------------------------

    /**
     * Returns a new {@link Fraction} equal to the sum of this and `other`.
     * Delegates to {@link Fraction.add}.
     * @param other - The {@link Fraction} to add.
     * @returns A new {@link Fraction} representing `this + other`.
     */
    add(other: Fraction): Fraction {
        return Fraction.add(this, other)
    }

    /**
     * Returns a new {@link Fraction} equal to this plus an integer.
     * Delegates to {@link Fraction.addScalar}.
     * @param scalar - A safe integer to add.
     * @returns A new {@link Fraction} representing `this + scalar`.
     */
    addScalar(scalar: number): Fraction {
        return Fraction.addScalar(this, scalar)
    }

    /**
     * Returns a new {@link Fraction} equal to the difference of this and `other`.
     * Delegates to {@link Fraction.subtract}.
     * @param other - The {@link Fraction} to subtract.
     * @returns A new {@link Fraction} representing `this - other`.
     */
    subtract(other: Fraction): Fraction {
        return Fraction.subtract(this, other)
    }

    /**
     * Returns a new {@link Fraction} equal to this minus an integer.
     * Delegates to {@link Fraction.subtractScalar}.
     * @param scalar - A safe integer to subtract.
     * @returns A new {@link Fraction} representing `this - scalar`.
     */
    subtractScalar(scalar: number): Fraction {
        return Fraction.subtractScalar(this, scalar)
    }

    /**
     * Returns a new {@link Fraction} equal to the product of this and `other`.
     * Delegates to {@link Fraction.multiply}.
     * @param other - The {@link Fraction} to multiply by.
     * @returns A new {@link Fraction} representing `this * other`.
     */
    multiply(other: Fraction): Fraction {
        return Fraction.multiply(this, other)
    }

    /**
     * Returns a new {@link Fraction} equal to this multiplied by a scalar integer.
     * Delegates to {@link Fraction.multiplyScalar}.
     * @param scalar - A safe integer to multiply by.
     * @returns A new {@link Fraction} representing `this * scalar`.
     */
    multiplyScalar(scalar: number): Fraction {
        return Fraction.multiplyScalar(this, scalar)
    }

    /**
     * Returns a new {@link Fraction} equal to this divided by `other`.
     * Delegates to {@link Fraction.divide}.
     * @param other - The {@link Fraction} to divide by.
     * @returns A new {@link Fraction} representing `this / other`.
     */
    divide(other: Fraction): Fraction {
        return Fraction.divide(this, other)
    }

    /**
     * Returns a new {@link Fraction} equal to this divided by a scalar integer.
     * Delegates to {@link Fraction.divideScalar}.
     * @param scalar - A non-zero safe integer to divide by.
     * @returns A new {@link Fraction} representing `this / scalar`.
     */
    divideScalar(scalar: number): Fraction {
        return Fraction.divideScalar(this, scalar)
    }

    /**
     * Returns a new {@link Fraction} with the sign of the numerator flipped.
     * Delegates to {@link Fraction.negate}.
     * @returns A new {@link Fraction} equal to `-this`.
     */
    negate(): Fraction {
        return Fraction.negate(this)
    }

    /**
     * Returns the reciprocal of this {@link Fraction}.
     * Delegates to {@link Fraction.reciprocal}.
     * @returns A new {@link Fraction} equal to `1 / this`.
     * @throws {DivideByZeroError} If the numerator is zero.
     */
    reciprocal(): Fraction {
        return Fraction.reciprocal(this)
    }

    /**
     * Returns this {@link Fraction} reduced to lowest terms.
     * Delegates to {@link Fraction.reduce}.
     * @returns A new {@link Fraction} in lowest terms.
     */
    reduce(): Fraction {
        return Fraction.reduce(this)
    }

    /**
     * Returns this {@link Fraction} with both terms multiplied by `scalar`.
     * Delegates to {@link Fraction.expand}.
     * @param scalar - A non-zero safe integer to multiply by.
     * @returns A new {@link Fraction} equal in value to this, with scaled terms.
     * @throws {DivideByZeroError} If `scalar` is zero.
     * @throws {InvalidIntegerError} If `scalar` is not a safe integer, or if the result overflows.
     */
    expand(scalar: number): Fraction {
        return Fraction.expand(this, scalar)
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Asserts that a numerator/denominator pair forms a legal {@link Fraction}.
     * @param numerator - The numerator to validate.
     * @param denominator - The denominator to validate.
     * @throws {DivideByZeroError} If `denominator` is zero.
     * @throws {InvalidIntegerError} If either value is not a safe integer.
     */
    private static ValidateFraction(numerator: number, denominator: number): void {
        if (denominator === 0) throw new DivideByZeroError()
        if (
            !Number.isSafeInteger(numerator) ||
            !Number.isSafeInteger(denominator)
        )
            throw new InvalidIntegerError(numerator, denominator)
    }

    /**
     * Asserts that a scalar is a non-zero safe integer.
     * @param scalar - The scalar to validate.
     * @throws {DivideByZeroError} If `scalar` is zero.
     * @throws {InvalidIntegerError} If `scalar` is not a safe integer.
     */
    private static ValidateScalar(scalar: number): void {
        if (scalar === 0) throw new DivideByZeroError()
        if (!Number.isSafeInteger(scalar)) throw new InvalidIntegerError(scalar)
    }

    /**
     * Computes the greatest common divisor of two integers using the Euclidean algorithm.
     * @param a - First integer.
     * @param b - Second integer.
     * @returns The GCD of `|a|` and `|b|`.
     */
    private static GCD(a: number, b: number): number {
        if (a === 0) return b
        if (b === 0) return a

        let divisor_a = Math.abs(a)
        let divisor_b = Math.abs(b)

        let swap: number

        while (divisor_b !== 0) {
            swap = divisor_b
            divisor_b = divisor_a % divisor_b
            divisor_a = swap
        }

        return divisor_a
    }
}
