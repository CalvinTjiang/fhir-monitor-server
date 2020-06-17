import Subject from "./Subject";
import StatCode from "./StatCode";
import Patient, { IPatient } from "./Patient";
import Measurement, { IMeasurement } from "./Measurement";
export interface IMonitorPair{
    patient : IPatient,
    measurement : IMeasurement | null
}
export interface IMonitor{
    statCode : string,
}
/**
 * Abstract class measurement for measurements of patient's vital
 */
export default abstract class Monitor extends Subject{
    private static readonly MIN_UPDATE_INTERVAL = 30000;
    private statCode: StatCode;
    private updateInterval : number;
    // protected patients : Set<Patient>;
    protected patients : {[id:string]: Patient};
    // initialise and empty timeoutFunction, and a tiemout id
    private intervalID : NodeJS.Timeout = setInterval(() => {}, Monitor.MIN_UPDATE_INTERVAL);

    constructor(statCode : StatCode){
        super();
        this.statCode = statCode;
        // this.patients = new Set<Patient>();
        this.patients = {};
        this.updateInterval = Monitor.MIN_UPDATE_INTERVAL;
        this.startUpdate();
    }

    /**
     * Get the patient details and measurement detail
     * @returns array of object that contain the patient and measurement details.
     */
    public getPatientsWithMeasurement() : Array<IMonitorPair>{
        let copyPatients : Array<IMonitorPair> = [];
        for (let id of Object.keys(this.patients)){
            let currentPatient : Patient = this.patients[id];
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

    private startUpdate() {
        let context = this;
        this.intervalID = setInterval(function() {
            context.update();
        }, this.updateInterval);
    }

    /**
     * run a continous check on the FHIR server and inform the observer if any update occurs
     */
    public update() : void {
        // console.log(`Monitor ${this.statCode} update called`);

        this.getFHIRData().then((res : boolean) => {
            if (res) {
                this.notify();
            }
        }).catch(err => {
            console.log(err);
        });
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
        // console.log("setUpdateInterval is called");
        // update the updateInterval
        this.updateInterval = updateInterval;
        // reset the setInterval with the new updateInterval
        clearInterval(this.intervalID);
        this.startUpdate();

        return true
    }

    /**
     * Get this Measurement's update interval
     * @returns this Measurement's update interval.
     */
    public getUpdateInterval() : number{
        return this.updateInterval;
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
        this.patients[patient.getId()] = patient;
    }

    /**
     * Remove a patient from this monitor.
     * @param patient a patient to be removed from this monitor's patients
     */
    public removePatient(ID : string) : void{
        delete this.patients[ID];
    }
    
    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    protected abstract getFHIRData() : Promise<boolean>;

    public abstract toJSON(): IMonitor;
}