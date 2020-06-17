import StatCode from "./StatCode";
import Measurement, { IMeasurement } from "./Measurement";

export interface IBloodPressureMeasurement extends IMeasurement{
    diastolic : number,
    systolic : number,
    unit : string
}
/**
 * A BloodPressureMeasurement class for diastolic and systolic blood pressure.
 */
export default class BloodPressureMeasurement extends Measurement {
    private diastolic: number;
    private systolic: number;
    private unit : string;

    constructor(data: IBloodPressureMeasurement) {
        super(StatCode.BLOOD_PRESSURE, data.effectiveDateTime);
        this.diastolic = data.diastolic;
        this.systolic = data.systolic;
        this.unit = data.unit;
    }

    /**
     * Set this BloodPressureMeasurement to the new data.
     * @param data a IBloodPresureMeasurement that contain the same data as this class
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public update(data : IBloodPressureMeasurement) : boolean{
        return false;
    }


    /**
     * Get this Measurement's JSON (primitive object) form.
     * @returns this method returns this Measurement's JSON (primitive object) form
     */
    public toJSON() : IBloodPressureMeasurement{
        return {
            statCode : this.statCode,
            effectiveDateTime: this.effectiveDateTime,
            diastolic: this.diastolic,
            systolic: this.systolic,
            unit : this.unit
        };
    }

}