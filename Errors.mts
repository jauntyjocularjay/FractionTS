class InvalidIntegerError extends RangeError {
    constructor(numerator: number, denominator: number) {
        super(`Fraction components must be integers. numerator: ${numerator}, denominator: ${denominator}`)
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