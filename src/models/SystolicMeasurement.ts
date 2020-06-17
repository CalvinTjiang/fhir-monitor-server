
import StatCode from "./StatCode";
import Measurement, { IMeasurement } from "./Measurement";

export interface ISystolicMeasurement extends IMeasurement{
    systolic : number,
    unit : string
}
/**
 * A BloodPressureMeasurement class for diastolic and systolic blood pressure.
 */
export default class SystolicMeasurement extends Measurement {
    private systolic: number;
    private unit : string;

    constructor(data: ISystolicMeasurement) {
        super(StatCode.SYSTOLIC_BLOOD_PRESSURE, data.effectiveDateTime);
        this.systolic = data.systolic;
        this.unit = data.unit;
    }

    /**
     * Set this BloodPressureMeasurement to the new data.
     * @param data a IBloodPresureMeasurement that contain the same data as this class
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public update(data : ISystolicMeasurement) : boolean{
        return false;
    }


    /**
     * Get this Measurement's JSON (primitive object) form.
     * @returns this method returns this Measurement's JSON (primitive object) form
     */
    public toJSON() : ISystolicMeasurement{
        return {
            statCode : this.statCode,
            effectiveDateTime: this.effectiveDateTime,
            systolic: this.systolic,
            unit : this.unit
        };
    }

}