/**
 * Abstract class measurement for measurements of patient's vital
 */
abstract class Monitor {
    private title: string;
    private statCode: StatCode;
    protected patients : Set<Patient>;

    constructor(title : string, statCode : StatCode){
        this.title = title;
        this.statCode = statCode;
        this.patients = new Set<Patient>();
    }

    /**
     * Get the patient details and measurement detail
     * @returns array of object that contain the patient and measurement details.
     */
    public getPatientsWithMeasurement() : Array<[object, object | null]>{
        let copyPatients : Array<[object, object | null]> = [];
        for (let value of this.patients.entries()){
            let patient : Patient= value[0];
            let measurement : Measurement | null = patient.getMeasurement(this.statCode);
            if (measurement === null){
                copyPatients.push([patient.toJSON(), measurement]);
            } else {
                copyPatients.push([patient.toJSON(), measurement.toJSON()]);
            }
        }
        return copyPatients;
    }

    /**
     * Get this Measurement's statCode
     * @returns this Measurement's statCode.
     */
    public getStatCode() : StatCode{
        return this.statCode;
    }

    /**
     * Add a patient to be monitored.
     * @param patient a Patient object to add to this monitor's patients.
     */
    public addPatient(patient: Patient) : void{
        this.patients.add(patient);
    }

    /**
     * Remove a patient from this monitor.
     * @param patient a patient to be removed from this monitor's patients
     */
    public removePatient(patient : Patient) : void{
        this.patients.delete(patient);
    }
    
    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public abstract getFHIRData() : Promise<boolean>;
}