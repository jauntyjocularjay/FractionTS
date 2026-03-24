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
    static reciprocal(other: Fraction): Fraction {
        if(other.n === 0) throw new DivideByZeroError()
        return new Fraction(other.d, other.n)
    }

    /**
     * @param numerator - Must be an integer. Will be negated if denominator is negative.
     * @param denominator - Must be a non-zero integer. Negative values will be normalised.
     * @param fraction - is also an acceptable argument
     */
    constructor(numerator: number, denominator: number) {
        if (denominator === 0) {
            throw new DivideByZeroError()
        } else if (numerator % 1 !== 0 || denominator % 1 !== 0) {
            throw new InvalidIntegerError()
        } else if (denominator < 0) {
            numerator = -numerator
            denominator = -denominator
        }

        this.n = numerator
        this.d = denominator
    }
}
