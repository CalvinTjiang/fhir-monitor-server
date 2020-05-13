import Subject from "./Subject";
export interface IMonitor{
    patient : IPatient,
    measurement : IMeasurement | null
}
/**
 * Abstract class measurement for measurements of patient's vital
 */
export default abstract class Monitor extends Subject{
    private static readonly MIN_UPDATE_INTERVAL = 30000;
    private title: string;
    private statCode: StatCode;
    private updateInterval : number;
    protected patients : Set<Patient>;

    constructor(title : string, statCode : StatCode){
        super();
        this.title = title;
        this.statCode = statCode;
        this.patients = new Set<Patient>();
        this.updateInterval = Monitor.MIN_UPDATE_INTERVAL;
        setTimeout(this.update, this.updateInterval);
    }

    /**
     * Get the patient details and measurement detail
     * @returns array of object that contain the patient and measurement details.
     */
    public getPatientsWithMeasurement() : Array<IMonitor>{
        let copyPatients : Array<IMonitor> = [];
        for (let value of this.patients.entries()){
            let currentPatient : Patient= value[0];
            let measurement : Measurement | null = currentPatient.getMeasurement(this.statCode);
            if (measurement === null){
                copyPatients.push({
                    patient : currentPatient.toJSON(), 
                    measurement : measurement
                });
            } else {
                copyPatients.push({
                    patient : currentPatient.toJSON(), 
                    measurement : measurement.toJSON()
                });
            }
        }
        return copyPatients;
    }

    /**
     * run a continous check on the FHIR server and inform the observer if any update occurs
     * @returns a promise boolean that indicate if any update has occurs
     */
    public update() : void{
        this.getFHIRData().then((res : boolean) => {
            if (res){
                this.notify();
            }
            setTimeout(this.update, this.updateInterval);
        })
    }

    /**
     * Set this monitor's update interval.
     * @param updateInterval the update interval (on milliseconds)
     * @returns return a boolean, false if the new update interval lower than the MIN_UPDATE_INTERVAL
     */
    public setUpdateInterval(updateInterval : number) : boolean{
        if (updateInterval < Monitor.MIN_UPDATE_INTERVAL){
            return false;
        }
        this.updateInterval = updateInterval;
        return true
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