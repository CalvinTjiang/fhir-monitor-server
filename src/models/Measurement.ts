/**
 * Abstract class measurement for measurements of patient's vital
 */
abstract class Measurement {
    protected statCode: StatCode;

    constructor(statCode: StatCode) {
        this.statCode = statCode;
    }

    abstract update(data: JSON): void;

    abstract toJSON(): JSON;
}