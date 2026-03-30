'use strict'

// Validates that the compiled ESM output is consumable from a CommonJS module
// via dynamic import(), which is the only native CJS interop path for .mjs files.

const assert = require('assert')

async function main() {
    const { default: Fraction, DivideByZeroError, InvalidIntegerError } = await import('../dist/Fraction.mjs')

    // Construction
    assert.strictEqual(new Fraction(1, 2).toString(), '1 / 2')
    assert.strictEqual(new Fraction(3, -4).toString(), '-3 / 4')
    assert.strictEqual(new Fraction(-3, 4).toString(), '-3 / 4')

    // Errors thrown at construction
    assert.throws(() => new Fraction(1, 0), DivideByZeroError)
    assert.throws(() => new Fraction(1.5, 2), InvalidIntegerError)
    assert.throws(() => new Fraction(1, 2.5), InvalidIntegerError)

    // Static constant
    assert.strictEqual(Fraction.Zero.toString(), '0 / 1')

    // Arithmetic
    assert.strictEqual(Fraction.addFraction(new Fraction(1, 4), new Fraction(1, 4)).toNumber(), 0.5)
    assert.strictEqual(Fraction.subtractFraction(new Fraction(3, 4), new Fraction(1, 4)).toNumber(), 0.5)
    assert.strictEqual(Fraction.multiplyFraction(new Fraction(1, 2), new Fraction(1, 2)).toNumber(), 0.25)
    assert.strictEqual(Fraction.divideFraction(new Fraction(1, 2), new Fraction(1, 4)).toNumber(), 2)

    // Reduce
    assert.strictEqual(Fraction.reduce(new Fraction(4, 8)).toString(), '1 / 2')

    console.log('CJS compatibility: all checks passed.')
}

main().catch(err => {
    console.error('CJS compatibility: FAILED\n', err)
    process.exit(1)
})
