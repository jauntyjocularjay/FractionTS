import Fraction from '../Fraction.mts'
import { DivideByZeroError, InvalidIntegerError } from '../Errors.mts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Asserts two Fractions are structurally equal by string representation. */
function eqFrac(actual: Fraction, n: number, d: number) {
    expect(actual.toString()).toBe(new Fraction(n, d).toString())
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('Fraction construction', () => {
    it('stores numerator and denominator', () => {
        expect(new Fraction(1, 2).toString()).toBe('1 / 2')
    })

    it('normalises negative denominator into numerator', () => {
        expect(new Fraction(3, -4).toString()).toBe('-3 / 4')
    })

    it('preserves negative numerator', () => {
        expect(new Fraction(-3, 4).toString()).toBe('-3 / 4')
    })

    it('throws DivideByZeroError for denominator 0', () => {
        expect(() => new Fraction(1, 0)).toThrow(DivideByZeroError)
    })

    it('throws InvalidIntegerError for non-integer numerator', () => {
        expect(() => new Fraction(1.5, 2)).toThrow(InvalidIntegerError)
    })

    it('throws InvalidIntegerError for non-integer denominator', () => {
        expect(() => new Fraction(1, 2.5)).toThrow(InvalidIntegerError)
    })
})

// ---------------------------------------------------------------------------
// Conversion methods
// ---------------------------------------------------------------------------

describe('Fraction.toString()', () => {
    it('formats positive fraction', () => {
        expect(new Fraction(1, 2).toString()).toBe('1 / 2')
    })

    it('formats negative fraction', () => {
        expect(new Fraction(-8, 4).toString()).toBe('-8 / 4')
    })
})

describe('Fraction.toNumber()', () => {
    it('returns correct float', () => {
        expect(new Fraction(1, 4).toNumber()).toBe(0.25)
    })

    it('returns negative float', () => {
        expect(new Fraction(-1, 4).toNumber()).toBe(-0.25)
    })
})

describe('Fraction.toInteger()', () => {
    it('truncates toward zero for positive', () => {
        expect(new Fraction(7, 2).toInteger()).toBe(3)
    })

    it('truncates toward zero for negative', () => {
        expect(new Fraction(-7, 2).toInteger()).toBe(-3)
    })

    it('returns 0 for proper fraction', () => {
        expect(new Fraction(1, 2).toInteger()).toBe(0)
    })
})

describe('Fraction.valueOf()', () => {
    it('coerces in numeric expression', () => {
        const half = new Fraction(1, 2)
        expect(Number(half) + 1).toBe(1.5)
    })

    it('coerces in comparison', () => {
        expect(Number(new Fraction(3, 4)) > Number(new Fraction(1, 4))).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// remainder getter
// ---------------------------------------------------------------------------

describe('Fraction.remainder', () => {
    it('returns fractional part for improper fraction', () => {
        eqFrac(new Fraction(7, 2).remainder, 1, 2)
    })

    it('returns itself for proper fraction', () => {
        eqFrac(new Fraction(1, 4).remainder, 1, 4)
    })

    it('returns zero remainder for whole number fraction', () => {
        eqFrac(new Fraction(4, 2).remainder, 0, 2)
    })
})

// ---------------------------------------------------------------------------
// Static factory / transform methods
// ---------------------------------------------------------------------------

describe('Fraction.Zero', () => {
    it('represents 0/1', () => {
        expect(Fraction.Zero.toString()).toBe('0 / 1')
        expect(Fraction.Zero.toNumber()).toBe(0)
    })
})

describe('Fraction.from()', () => {
    it('creates an equal copy', () => {
        const f = new Fraction(3, 4)
        expect(Fraction.from(f).toString()).toBe(f.toString())
    })
})

describe('Fraction.negate()', () => {
    it('flips sign of positive fraction', () => {
        eqFrac(Fraction.negate(new Fraction(3, 4)), -3, 4)
    })

    it('flips sign of negative fraction', () => {
        eqFrac(Fraction.negate(new Fraction(-3, 4)), 3, 4)
    })
})

describe('Fraction.reciprocal()', () => {
    it('swaps numerator and denominator', () => {
        eqFrac(Fraction.reciprocal(new Fraction(3, 4)), 4, 3)
    })

    it('normalises sign on swap', () => {
        eqFrac(Fraction.reciprocal(new Fraction(-3, 4)), -4, 3)
    })

    it('throws DivideByZeroError when numerator is 0', () => {
        expect(() => Fraction.reciprocal(new Fraction(0, 1))).toThrow(DivideByZeroError)
    })
})

describe('Fraction.reduce()', () => {
    it('divides both terms by GCD', () => {
        eqFrac(Fraction.reduce(new Fraction(4, 8)), 1, 2)
    })

    it('leaves already-reduced fraction unchanged', () => {
        eqFrac(Fraction.reduce(new Fraction(3, 4)), 3, 4)
    })

    it('reduces negative fraction', () => {
        eqFrac(Fraction.reduce(new Fraction(-6, 9)), -2, 3)
    })
})

describe('Fraction.expand()', () => {
    it('scales both terms by scalar', () => {
        eqFrac(Fraction.expand(new Fraction(1, 2), 3), 3, 6)
    })

    it('throws DivideByZeroError for scalar 0', () => {
        expect(() => Fraction.expand(new Fraction(1, 2), 0)).toThrow(DivideByZeroError)
    })
})

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

describe('Fraction.add()', () => {
    it('adds two fractions with the same denominator', () => {
        eqFrac(Fraction.add(new Fraction(1, 4), new Fraction(1, 4)), 2, 4)
    })

    it('adds fractions where one denominator divides the other', () => {
        // 1/2 + 1/4: lcm=4, only 1/2 is scaled → 2/4 + 1/4 = 3/4
        eqFrac(Fraction.add(new Fraction(1, 2), new Fraction(1, 4)), 3, 4)
    })

    it('adds fractions with coprime denominators', () => {
        // 1/3 + 1/5: lcm=15, both scaled → 5/15 + 3/15 = 8/15
        eqFrac(Fraction.add(new Fraction(1, 3), new Fraction(1, 5)), 8, 15)
    })

    it('adds positive and negative fraction', () => {
        expect(Fraction.add(new Fraction(3, 4), new Fraction(-1, 4)).toNumber()).toBe(0.5)
    })
})

describe('Fraction.addScalar()', () => {
    it('adds positive integer', () => {
        eqFrac(Fraction.addScalar(new Fraction(1, 4), 1), 5, 4)
    })

    it('adds negative integer', () => {
        eqFrac(Fraction.addScalar(new Fraction(1, 4), -1), -3, 4)
    })

    it('throws InvalidIntegerError for float scalar', () => {
        expect(() => Fraction.addScalar(new Fraction(1, 4), 0.5)).toThrow(InvalidIntegerError)
    })
})

describe('Fraction.subtract()', () => {
    it('subtracts fractions with the same denominator', () => {
        eqFrac(Fraction.subtract(new Fraction(3, 4), new Fraction(1, 4)), 2, 4)
    })

    it('subtracts fractions where one denominator divides the other', () => {
        // 3/4 - 1/2: lcm=4, only 1/2 is scaled → 3/4 - 2/4 = 1/4
        eqFrac(Fraction.subtract(new Fraction(3, 4), new Fraction(1, 2)), 1, 4)
    })

    it('subtracts fractions with coprime denominators', () => {
        // 1/3 - 1/5: lcm=15, both scaled → 5/15 - 3/15 = 2/15
        eqFrac(Fraction.subtract(new Fraction(1, 3), new Fraction(1, 5)), 2, 15)
    })

    it('produces negative result when smaller minus larger', () => {
        expect(Fraction.subtract(new Fraction(1, 4), new Fraction(3, 4)).toNumber()).toBe(-0.5)
    })
})

describe('Fraction.subtractScalar()', () => {
    it('subtracts positive integer', () => {
        eqFrac(Fraction.subtractScalar(new Fraction(5, 4), 1), 1, 4)
    })

    it('subtracting negative integer increases value', () => {
        eqFrac(Fraction.subtractScalar(new Fraction(1, 4), -1), 5, 4)
    })
})

describe('Fraction.multiply()', () => {
    it('multiplies two positive fractions', () => {
        eqFrac(Fraction.multiply(new Fraction(2, 3), new Fraction(3, 4)), 6, 12)
    })

    it('multiplies positive by negative', () => {
        expect(Fraction.multiply(new Fraction(1, 2), new Fraction(-1, 2)).toNumber()).toBe(-0.25)
    })

    it('multiplying by Zero gives Zero', () => {
        expect(Fraction.multiply(new Fraction(3, 4), Fraction.Zero).toNumber()).toBe(0)
    })
})

describe('Fraction.multiplyScalar()', () => {
    it('scales numerator by positive scalar', () => {
        eqFrac(Fraction.multiplyScalar(new Fraction(1, 4), 3), 3, 4)
    })

    it('flips sign with negative scalar', () => {
        eqFrac(Fraction.multiplyScalar(new Fraction(1, 4), -1), -1, 4)
    })

    it('throws DivideByZeroError for scalar 0', () => {
        expect(() => Fraction.multiplyScalar(new Fraction(1, 4), 0)).toThrow(DivideByZeroError)
    })
})

describe('Fraction.divide()', () => {
    it('divides two fractions', () => {
        eqFrac(Fraction.divide(new Fraction(1, 2), new Fraction(3, 4)), 4, 6)
    })

    it('dividing by itself gives 1', () => {
        expect(Fraction.divide(new Fraction(3, 4), new Fraction(3, 4)).toNumber()).toBe(1)
    })

    it('throws DivideByZeroError when divisor numerator is 0', () => {
        expect(() => Fraction.divide(new Fraction(1, 2), Fraction.Zero)).toThrow(DivideByZeroError)
    })
})

describe('Fraction.divideScalar()', () => {
    it('divides by positive integer', () => {
        eqFrac(Fraction.divideScalar(new Fraction(3, 4), 3), 3, 12)
    })

    it('divides by negative integer', () => {
        expect(Fraction.divideScalar(new Fraction(3, 4), -1).toNumber()).toBe(-0.75)
    })

    it('throws DivideByZeroError for scalar 0', () => {
        expect(() => Fraction.divideScalar(new Fraction(1, 2), 0)).toThrow(DivideByZeroError)
    })
})
