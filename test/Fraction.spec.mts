import {default as Fraction, DivideByZeroError, InvalidIntegerError} from '../Fraction.mts'

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

    it('reduces fraction when reduce flag is true', () => {
        expect(new Fraction(4, 8, true).toString()).toBe('1 / 2')
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

describe('Fraction.Add()', () => {
    it('adds two fractions with the same denominator', () => {
        eqFrac(Fraction.addFraction(new Fraction(1, 4), new Fraction(1, 4)), 2, 4)
    })

    it('adds fractions where one denominator divides the other', () => {
        // 1/2 + 1/4: lcm=4, only 1/2 is scaled → 2/4 + 1/4 = 3/4
        eqFrac(Fraction.addFraction(new Fraction(1, 2), new Fraction(1, 4)), 3, 4)
    })

    it('adds fractions with coprime denominators', () => {
        // 1/3 + 1/5: lcm=15, both scaled → 5/15 + 3/15 = 8/15
        eqFrac(Fraction.addFraction(new Fraction(1, 3), new Fraction(1, 5)), 8, 15)
    })

    it('adds positive and negative fraction', () => {
        expect(Fraction.addFraction(new Fraction(3, 4), new Fraction(-1, 4)).toNumber()).toBe(0.5)
    })

    it('reduces result when reduce flag is true', () => {
        // 1/4 + 1/4 = 2/4, reduced to 1/2
        eqFrac(Fraction.addFraction(new Fraction(1, 4), new Fraction(1, 4), true), 1, 2)
    })
})

describe('Fraction.AddScalar()', () => {
    it('adds positive integer', () => {
        eqFrac(Fraction.addScalar(new Fraction(1, 4), 1), 5, 4)
    })

    it('adds negative integer', () => {
        eqFrac(Fraction.addScalar(new Fraction(1, 4), -1), -3, 4)
    })

    it('throws InvalidIntegerError for float scalar', () => {
        expect(() => Fraction.addScalar(new Fraction(1, 4), 0.5)).toThrow(InvalidIntegerError)
    })

    it('reduces result when reduce flag is true', () => {
        // 2/6 + 1 = 8/6, reduced to 4/3
        eqFrac(Fraction.addScalar(new Fraction(2, 6), 1, true), 4, 3)
    })
})

describe('Fraction.subtract()', () => {
    it('subtracts fractions with the same denominator', () => {
        eqFrac(Fraction.subtractFraction(new Fraction(3, 4), new Fraction(1, 4)), 2, 4)
    })

    it('subtracts fractions where one denominator divides the other', () => {
        // 3/4 - 1/2: lcm=4, only 1/2 is scaled → 3/4 - 2/4 = 1/4
        eqFrac(Fraction.subtractFraction(new Fraction(3, 4), new Fraction(1, 2)), 1, 4)
    })

    it('subtracts fractions with coprime denominators', () => {
        // 1/3 - 1/5: lcm=15, both scaled → 5/15 - 3/15 = 2/15
        eqFrac(Fraction.subtractFraction(new Fraction(1, 3), new Fraction(1, 5)), 2, 15)
    })

    it('produces negative result when smaller minus larger', () => {
        expect(Fraction.subtractFraction(new Fraction(1, 4), new Fraction(3, 4)).toNumber()).toBe(-0.5)
    })

    it('reduces result when reduce flag is true', () => {
        // 3/4 - 1/4 = 2/4, reduced to 1/2
        eqFrac(Fraction.subtractFraction(new Fraction(3, 4), new Fraction(1, 4), true), 1, 2)
    })
})

describe('Fraction.subtractScalar()', () => {
    it('subtracts positive integer', () => {
        eqFrac(Fraction.subtractScalar(new Fraction(5, 4), 1), 1, 4)
    })

    it('subtracting negative integer increases value', () => {
        eqFrac(Fraction.subtractScalar(new Fraction(1, 4), -1), 5, 4)
    })

    it('reduces result when reduce flag is true', () => {
        // 10/4 - 1 = 6/4, reduced to 3/2
        eqFrac(Fraction.subtractScalar(new Fraction(10, 4), 1, true), 3, 2)
    })
})

describe('Fraction.Multiply()', () => {
    it('multiplies two positive fractions', () => {
        eqFrac(Fraction.multiplyFraction(new Fraction(2, 3), new Fraction(3, 4)), 6, 12)
    })

    it('multiplies positive by negative', () => {
        expect(Fraction.multiplyFraction(new Fraction(1, 2), new Fraction(-1, 2)).toNumber()).toBe(-0.25)
    })

    it('multiplying by Zero gives Zero', () => {
        expect(Fraction.multiplyFraction(new Fraction(3, 4), Fraction.Zero).toNumber()).toBe(0)
    })

    it('reduces result when reduce flag is true', () => {
        // 2/3 * 3/4 = 6/12, reduced to 1/2
        eqFrac(Fraction.multiplyFraction(new Fraction(2, 3), new Fraction(3, 4), true), 1, 2)
    })
})

describe('Fraction.MultiplyScalar()', () => {
    it('scales numerator by positive scalar', () => {
        eqFrac(Fraction.multiplyScalar(new Fraction(1, 4), 3), 3, 4)
    })

    it('flips sign with negative scalar', () => {
        eqFrac(Fraction.multiplyScalar(new Fraction(1, 4), -1), -1, 4)
    })

    it('returns Zero for scalar 0', () => {
        expect(Fraction.multiplyScalar(new Fraction(1, 4), 0).toNumber()).toBe(0)
    })

    it('reduces result when reduce flag is true', () => {
        // 1/4 * 2 = 2/4, reduced to 1/2
        eqFrac(Fraction.multiplyScalar(new Fraction(1, 4), 2, true), 1, 2)
    })
})

// ---------------------------------------------------------------------------
// Equality
// ---------------------------------------------------------------------------

describe('Fraction.equals() / instance equals()', () => {
    it('returns true for identical fractions', () => {
        expect(Fraction.equals(new Fraction(1, 2), new Fraction(1, 2))).toBe(true)
    })

    it('returns true for equivalent unreduced fractions', () => {
        expect(Fraction.equals(new Fraction(1, 2), new Fraction(2, 4))).toBe(true)
    })

    it('returns false for different values', () => {
        expect(Fraction.equals(new Fraction(1, 2), new Fraction(1, 3))).toBe(false)
    })

    it('returns true for equivalent negative fractions', () => {
        expect(Fraction.equals(new Fraction(-2, 4), new Fraction(-1, 2))).toBe(true)
    })

    it('instance form matches static form', () => {
        const a = new Fraction(3, 6)
        const b = new Fraction(1, 2)
        expect(a.equals(b)).toBe(Fraction.equals(a, b))
    })
})

describe('Fraction.Divide()', () => {
    it('divides two fractions', () => {
        eqFrac(Fraction.divideFraction(new Fraction(1, 2), new Fraction(3, 4)), 4, 6)
    })

    it('dividing by itself gives 1', () => {
        expect(Fraction.divideFraction(new Fraction(3, 4), new Fraction(3, 4)).toNumber()).toBe(1)
    })

    it('throws DivideByZeroError when divisor numerator is 0', () => {
        expect(() => Fraction.divideFraction(new Fraction(1, 2), Fraction.Zero)).toThrow(DivideByZeroError)
    })

    it('reduces result when reduce flag is true', () => {
        // (1/2) / (3/4) = 4/6, reduced to 2/3
        eqFrac(Fraction.divideFraction(new Fraction(1, 2), new Fraction(3, 4), true), 2, 3)
    })
})

describe('Fraction.DivideScalar()', () => {
    it('divides by positive integer', () => {
        eqFrac(Fraction.divideScalar(new Fraction(3, 4), 3), 3, 12)
    })

    it('divides by negative integer', () => {
        expect(Fraction.divideScalar(new Fraction(3, 4), -1).toNumber()).toBe(-0.75)
    })

    it('throws DivideByZeroError for scalar 0', () => {
        expect(() => Fraction.divideScalar(new Fraction(1, 2), 0)).toThrow(DivideByZeroError)
    })

    it('reduces result when reduce flag is true', () => {
        // 3/4 / 3 = 3/12, reduced to 1/4
        eqFrac(Fraction.divideScalar(new Fraction(3, 4), 3, true), 1, 4)
    })
})

// ---------------------------------------------------------------------------
// Instance wrappers (chainable API)
// ---------------------------------------------------------------------------

describe('instance wrapper methods delegate to static counterparts', () => {
    const a = new Fraction(1, 2)
    const b = new Fraction(1, 4)

    it('add()', ()          => { eqFrac(a.add(b),             3, 4) })
    it('addScalar()', ()    => { eqFrac(a.add(1),       3, 2) })
    it('subtract() fraction', ()     => { eqFrac(a.subtract(b),        1, 4) })
    it('subtract() scalar',  () => { eqFrac(a.subtract(1), -1, 2) })
    it('multiply()', ()     => { eqFrac(a.multiply(b),         1, 8) })
    it('multiplyScalar()', () => { eqFrac(a.multiply(3),  3, 2) })
    it('divide()', ()       => { eqFrac(a.divide(b),           4, 2) })
    it('divideScalar()', () => { eqFrac(a.divide(2),     1, 4) })
    it('negate()', ()       => { eqFrac(a.negate(),           -1, 2) })
    it('reciprocal()', ()   => { eqFrac(a.reciprocal(),        2, 1) })
    it('reduce()', ()       => { eqFrac(new Fraction(4, 8).reduce(), 1, 2) })
    it('expand()', ()       => { eqFrac(a.expand(3),           3, 6) })
})

describe('chaining', () => {
    it('supports multi-step chains', () => {
        // (1/2 + 1/4) * 2 = 3/4 * 2 = 6/4, reduced = 3/2
        const result = new Fraction(1, 2)
            .add(new Fraction(1, 4))
            .multiply(2)
            .reduce()
        eqFrac(result, 3, 2)
    })

    it('negate then reciprocal', () => {
        // reciprocal of -(3/4) = -4/3
        eqFrac(new Fraction(3, 4).negate().reciprocal(), -4, 3)
    })

    it('reduce flag mid-chain produces same value as .reduce() mid-chain', () => {
        // Both paths: 1/4 + 1/4 → 1/2 → * 4 → 2/1
        const withFlag   = new Fraction(1, 4)
            .add(new Fraction(1, 4), true)
            .multiply(4)
        const withMethod = new Fraction(1, 4)
            .add(new Fraction(1, 4))
            .reduce()
            .multiply(4)
        expect(withFlag.equals(withMethod)).toBe(true)
    })

    it('divide then add using inline reduce', () => {
        // 3/4 ÷ 3 (reduce) = 1/4; + 1/4 = 2/4
        eqFrac(new Fraction(3, 4).divide(3, true).add(new Fraction(1, 4)), 2, 4)
    })

    it('longer chain: multiply, add, subtract, reduce', () => {
        // 2/3 * 3/4 = 6/12; + 3/12 = 9/12; - 3/12 = 6/12; reduce = 1/2
        const result = new Fraction(2, 3)
            .multiply(new Fraction(3, 4))
            .add(new Fraction(3, 12))
            .subtract(new Fraction(3, 12))
            .reduce()
        eqFrac(result, 1, 2)
    })

    it('chaining with reduce flag at each step keeps value equal to fully-reduced chain', () => {
        // Each step reduces eagerly vs reducing only at the end — values must be equal
        const eager = new Fraction(2, 4)
            .add(new Fraction(2, 4), true)   // 4/4 → 1/1
            .multiply(new Fraction(3, 6), true) // 1/1 * 1/2 = 1/2
            .subtract(new Fraction(1, 4), true) // 1/2 - 1/4 = 1/4

        const lazy = new Fraction(2, 4)
            .add(new Fraction(2, 4))
            .multiply(new Fraction(3, 6))
            .subtract(new Fraction(1, 4))
            .reduce()

        expect(eager.equals(lazy)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Instance reduce flag
// ---------------------------------------------------------------------------

describe('instance arithmetic reduce flag', () => {
    it('add(Fraction, true) reduces result', () => {
        // 1/4 + 1/4 = 2/4, reduced to 1/2
        eqFrac(new Fraction(1, 4).add(new Fraction(1, 4), true), 1, 2)
    })

    it('add(number, true) reduces result', () => {
        // 2/6 + 1 = 8/6, reduced to 4/3
        eqFrac(new Fraction(2, 6).add(1, true), 4, 3)
    })

    it('subtract(Fraction, true) reduces result', () => {
        // 3/4 - 1/4 = 2/4, reduced to 1/2
        eqFrac(new Fraction(3, 4).subtract(new Fraction(1, 4), true), 1, 2)
    })

    it('subtract(number, true) reduces result', () => {
        // 10/4 - 1 = 6/4, reduced to 3/2
        eqFrac(new Fraction(10, 4).subtract(1, true), 3, 2)
    })

    it('multiply(Fraction, true) reduces result', () => {
        // 2/3 * 3/4 = 6/12, reduced to 1/2
        eqFrac(new Fraction(2, 3).multiply(new Fraction(3, 4), true), 1, 2)
    })

    it('multiply(number, true) reduces result', () => {
        // 1/4 * 2 = 2/4, reduced to 1/2
        eqFrac(new Fraction(1, 4).multiply(2, true), 1, 2)
    })

    it('divide(Fraction, true) reduces result', () => {
        // (1/2) / (3/4) = 4/6, reduced to 2/3
        eqFrac(new Fraction(1, 2).divide(new Fraction(3, 4), true), 2, 3)
    })

    it('divide(number, true) reduces result', () => {
        // 3/4 / 3 = 3/12, reduced to 1/4
        eqFrac(new Fraction(3, 4).divide(3, true), 1, 4)
    })
})
