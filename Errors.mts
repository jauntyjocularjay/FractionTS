class InvalidIntegerError extends RangeError {
    constructor(int_a: number, int_b: number|null = null) {
        super(`Fraction components must be integers. numerator: ${int_a} ${int_b ?? `, denominator: ${int_b}` }`)
        this.name = 'InvalidIntegerError'
    }
}

class DivideByZeroError extends RangeError {
    constructor() {
        super(`Cannot divide by zero. Use Fraction.Zero instead.`)
        this.name = 'DivideByZeroError'
    }
}

export {
    InvalidIntegerError,
    DivideByZeroError
}