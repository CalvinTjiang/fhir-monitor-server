interface IMeasurement{
    statCode : string,
    effectiveDateTime: Date,
}
/**
 * Abstract class measurement for measurements of patient's vital
 */
abstract class Measurement {
    protected statCode: StatCode;
    protected effectiveDateTime : Date;

    constructor(statCode: StatCode, effectiveDateTime : Date) {
        this.statCode = statCode;
        this.effectiveDateTime = effectiveDateTime;
    }

    /**
     * Get this Measurement's statCode.
     * @returns this method returns this Measurement's statCode
     */
    public getStatCode():StatCode {
        return this.statCode;
    }

    /**
     * Set this Measurement's effective date time.
     * @param effectiveDateTime an effectiveDateTime date
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public setEffectiveDateTime(effectiveDateTime : Date) : boolean{
        if (this.effectiveDateTime === effectiveDateTime){
            return false
        }
        this.effectiveDateTime = effectiveDateTime;
        return true
    }

    /**
     * Get this Measurement's effective date time.
     * @returns return date object
     */
    public getEffectiveDateTime() : Date{
        return this.effectiveDateTime;
    }

    abstract update(data: object): boolean;

    abstract toJSON(): IMeasurement;
}