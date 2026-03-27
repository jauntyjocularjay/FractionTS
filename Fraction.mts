import { InvalidIntegerError, DivideByZeroError } from './Errors.mts'

class Fraction {
    private readonly n: number
    private readonly d: number

    /**
     * The additive identity of the {@link Fraction} type, representing 0/1.
     * Prefer this over `new Fraction(0, 1)` to avoid unnecessary allocations.
     */
    static readonly Zero: Fraction = new Fraction(0, 1)

    /**
     * @param numerator - Must be an integer. Will be negated if denominator is negative.
     * @param denominator - Must be a non-zero integer. Negative values will be normalised.
     * @param fraction - is also an acceptable argument
     */
    constructor(numerator: number, denominator: number) {
        if (denominator < 0) {
            numerator = -numerator
            denominator = -denominator
        }

        Fraction.ValidateFraction(numerator, denominator)

        this.n = numerator
        this.d = denominator
    }

    toString() {
        return `${this.n} / ${this.d}`
    }

    toNumber() {
        return this.n/this.d
    }

    toInteger() {
        return Math.trunc(this.toNumber())
    }

    /**
     * Creates a new {@link Fraction} from an existing one.
     * @param other - The source {@link Fraction} to construct from.
     * @returns A new {@link Fraction} with the same numerator and denominator as `other`.
     */
    static from(other: Fraction): Fraction {
        return new Fraction(other.n, other.d)
    }
    static negate(other: Fraction): Fraction {
        return new Fraction(-other.n, other.d)
    }
    private static ValidateFraction(numerator: number, denominator: number) {
        if (denominator === 0) throw new DivideByZeroError()
        if (
            !Number.isSafeInteger(numerator) ||
            !Number.isSafeInteger(denominator)
        )
            throw new InvalidIntegerError(numerator, denominator)
    }
    static reciprocal(other: Fraction): Fraction {
        if (other.n === 0) throw new DivideByZeroError()

        return new Fraction(other.d, other.n)
    }
    private static ValidateScalar(scalar: number) {
        if (scalar === 0) throw new DivideByZeroError()
        if (!Number.isSafeInteger(scalar)) throw new InvalidIntegerError(scalar)
    }
    private static GCD(a: number, b: number): number {
        if (a === 0) return b
        if (b === 0) return a

        a = Math.abs(a)
        b = Math.abs(b)

        let swap: number

        while (b !== 0) {
            swap = b
            b = a % b
            a = swap
        }

        return a
    }
    static reduce(fraction: Fraction): Fraction {
        const reducer: number = Fraction.GCD(fraction.n, fraction.d)
        return new Fraction(fraction.n / reducer, fraction.d / reducer)
    }
    static expand(fraction: Fraction, scalar: number) {
        Fraction.ValidateScalar(scalar)
        const numerator = fraction.n * scalar
        const denominator = fraction.n * scalar
        if (
            !Number.isSafeInteger(numerator) ||
            !Number.isSafeInteger(denominator)
        )
            throw new InvalidIntegerError(numerator, denominator)

        return new Fraction(numerator, denominator)
    }
    get remainder() {
        return new Fraction(this.n % this.d, this.d)
    }
}
