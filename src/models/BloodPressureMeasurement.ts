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
        let isUpdated = false;
        isUpdated = this.setEffectiveDateTime(data.effectiveDateTime) || isUpdated;
        isUpdated = this.setDiastolic(data.diastolic) || isUpdated;
        isUpdated = this.setSystolic(data.systolic) || isUpdated;
        isUpdated = this.setUnit(data.unit) || isUpdated;
        return isUpdated
    }

    /**
     * Set this measurements's diastolic blood pressure.
     * @param diastolic a number for the new Diastolic Blood Pressure
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public setDiastolic(diastolic : number) : boolean{
        if (this.diastolic === diastolic){
            return false
        }
        this.diastolic = diastolic;
        return true
    }

    /**
     * Set this measurements's systolic blood pressure.
     * @param systolic a number for the new systolic Blood Pressure
     * @returns return a boolean to inform if an update occurs, true if update occurs, otherwise false
     */
    public setSystolic(systolic : number) : boolean{
        if (this.systolic === systolic){
            return false
        }
        this.systolic = systolic;
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