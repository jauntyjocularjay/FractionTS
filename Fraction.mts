class Fraction {
    n: number
    d: number

    static readonly Zero: Fraction = new Fraction(0, 1)

    /**
     * @param numerator - Must be an integer. Will be negated if denominator is negative.
     * @param denominator - Must be a non-zero integer. Negative values will be normalised.
     */
    constructor(numerator: number, denominator: number) {
        if (denominator === 0) {
            throw new DivideByZeroError()
        }
        if (numerator % 1 !== 0 || denominator % 1 !== 0) {
            throw new InvalidIntegerError()
        } else if (denominator === 0) {
            numerator = -numerator
            denominator = -denominator
        }

        this.n = numerator
        this.d = denominator
    }
}

class InvalidIntegerError extends RangeError {
    constructor()
    {
        super(`Fraction components must be integers.`)
        this.name = 'InvalidIntegerError'
    }
}

class DivideByZeroError extends RangeError {
    constructor(){
        super(`The denominator cannot be 0. Use Fraction.Zero.`)
        this.name = 'DivideByZeroError'
    }
}