class InvalidIntegerError extends RangeError {
    constructor() {
        super(`Fraction components must be integers.`)
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