import StatCode from "./StatCode";
import Measurement from "./Measurement";

export default class Measurements {
    private measurements: {[statCode: string]: Array<Measurement>} = {};
    private static MAX_DATA_COUNT_EACH_MEASUREMENT = 5;

    /**
     * Add measurement to this Measurements, make sure there are only 5 maximum data with the latest effectiveDateTime
     * @param measurement the measurement that will be added to this measurements
     * @return boolean true if the given measurement is new measurement and it is properly added to the array
     */
    public addMeasurement(measurement: Measurement) : boolean{
        let statCode: StatCode = measurement.getStatCode();
        // create empty array if the entry in dictionary is still undefined
        if (!this.measurements[statCode]) {
            this.measurements[statCode] = new Array<Measurement>();
        }

        // check if there is duplicate
        for (let m of this.measurements[statCode]) {
            if (measurement.getEffectiveDateTime() == m.getEffectiveDateTime()) {
                return false;
            }
        }

        // insert measurement sorted by effectiveDateTime descending
        this.measurements[statCode].push(measurement);
        for(let i: number = this.measurements[statCode].length - 1; i >= 1; i--) {
            if (this.measurements[statCode][i].getEffectiveDateTime() > this.measurements[statCode][i-1].getEffectiveDateTime()) {
                let temp: Measurement = this.measurements[statCode][i];
                this.measurements[statCode][i] = this.measurements[statCode][i-1];
                this.measurements[statCode][i-1] = temp;
            }
        }

        let updated: boolean = true;
        // pop from array if length is greater than 5
        if (this.measurements[statCode].length > Measurements.MAX_DATA_COUNT_EACH_MEASUREMENT) {
            updated = this.measurements[statCode].pop() != measurement;
        }
        return updated;
    }

    /**
     * Get 5 of the latest measurements
     * @param statcode the statcode of the measurement
     * @return An array of measurements
     */
    public getMeasurements(statcode:StatCode): Array<Measurement> | null {
        if (!this.measurements[statcode]) {
            return null;
        }
        return this.measurements[statcode];
    }

    /**
     * Return the measurement with the given statCode with the latest effectiveDateTime
     * @param statCode the statcode of the measurement
     * @return the latest measurement or null if there is no measurement
     */
    public getLatestMeasurement(statCode: StatCode): Measurement | null {
        if (!this.measurements[statCode]) {
            return null;
        }
        if (this.measurements[statCode].length === 0) {
            return null;
        }
        return this.measurements[statCode][0];
    }

}