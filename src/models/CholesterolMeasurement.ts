interface ICholesterolMeasurement extends IMeasurement{
    totalCholesterol : number,
    unit : string,
    isAboveAverage : boolean
}
/**
 * A CholesterolMeasurement class with total cholesterol
 */
class CholesterolMeasurement extends Measurement {
    private static averageTotalCholesterol : number;
    private totalCholesterol: number;
    private unit : string;

    public static setAverage(averageTotalCholesterol : number) : void{
        CholesterolMeasurement.averageTotalCholesterol = averageTotalCholesterol;
    }

    constructor(data: ICholesterolMeasurement) {
        super(StatCode.TOTAL_CHOLESTEROL, data.effectiveDateTime);
        this.totalCholesterol = data.totalCholesterol;
        this.unit = data.unit;
    }

    /**
     * Set this CholesterolMeasurement to the new data.
     * @param data a ICholesterolMeasurement that contain the same data as this class
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public update(data : ICholesterolMeasurement) : boolean{
        let isUpdated = false;
        isUpdated = this.setEffectiveDateTime(data.effectiveDateTime) || isUpdated;
        isUpdated = this.setTotalCholesterol(data.totalCholesterol) || isUpdated;
        isUpdated = this.setUnit(data.unit) || isUpdated;
        return isUpdated
    }

    /**
     * Set this CholesterolMeasurement's totalCholesterol.
     * @param totalCholesterol a number for the new totalCholesterol
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public setTotalCholesterol(totalCholesterol : number) : boolean{
        if (this.totalCholesterol === totalCholesterol){
            return false
        }
        this.totalCholesterol = totalCholesterol;
        return true
    }

    /**
     * Set this CholesterolMeasurement's unit.
     * @param unit a string for the new unit
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public setUnit(unit : string) : boolean{
        if (this.unit === unit){
            return false
        }
        this.unit = unit;
        return true
    }

    /**
     * Get this Measurement's JSON (primitive object) form.
     * @returns this method returns this Measurement's JSON (primitive object) form
     */
    public toJSON() : ICholesterolMeasurement{
        return {
            statCode : this.statCode,
            effectiveDateTime: this.effectiveDateTime,
            totalCholesterol : this.totalCholesterol,
            unit : this.unit,
            isAboveAverage : this.totalCholesterol > CholesterolMeasurement.averageTotalCholesterol
        };
    }

}