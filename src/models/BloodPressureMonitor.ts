import Monitor, { IMonitor } from "./Monitor";
import fetch from "node-fetch";
import StatCode from "./StatCode";
import Patient from "./Patient";
import Measurement from "./Measurement";
import BloodPressureMeasurement from "./BloodPressureMeasurement";

export interface IBloodPressureMonitor extends IMonitor{
    systolicLimit : number,
    diastolicLimit : number
}

/**
 * Abstract class measurement for measurements of patient's vital
 */
export default class BloodPressureMonitor extends Monitor {
    private systolicLimit : number = 120;
    private diastolicLimit: number = 85;

    constructor(){
        super(StatCode.BLOOD_PRESSURE);
    }

    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    protected getFHIRData() : Promise<boolean>{
        // console.log("Monitor update getFHRIData is called");

        // if monitor does not have any patient, return immediately
        if (Object.keys(this.patients).length === 0) {
            return new Promise((result)=>false);
        }

        let PATIENT = "Patient/".length;
        let patientString : string = "";

        for (let id of Object.keys(this.patients)){
            let patient : Patient = this.patients[id];

            // Construct the querystring for patient
            if (patientString.length !== 0){
                patientString =  patientString + ",";
            }
            patientString = patientString + patient.getId();
        }

        let link : string = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Observation?_count=1000&code=${this.getStatCode()}&patient=${patientString}`;

        // console.log(link);

        // Get the observation data for the statCode
        return fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json()
            }).then((data) : boolean => {
                // if no observation is found return false
                if (data.total === 0){
                    return false;
                }

                let updated : boolean = false;
                console.log("Refreshing data");
                // for each entry on the response
                for (let entry of data.entry){
                    // Get the required data and object reference
                    let resource = entry.resource;
                    let patientId : string = resource.subject.reference.slice(PATIENT);
                    let oldMeasurement : Measurement | null = this.patients[patientId].getMeasurement(this.getStatCode());
                    let newMeasurement = {
                        statCode: this.getStatCode(),
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        diastolic : 0,
                        systolic : 0,
                        unit : ""
                    }
                    for (let comp of resource.component) {
                        switch (comp.code.coding.code) {
                            case StatCode.DIASTOLIC_BLOOD_PRESSURE:
                                newMeasurement.diastolic = comp.valueQuantity.value;
                                newMeasurement.unit = comp.valueQuantity.unit;
                                break;
                            case StatCode.SYSTOLIC_BLOOD_PRESSURE:
                                newMeasurement.systolic = comp.valueQuantity.value;
                                newMeasurement.unit = comp.valueQuantity.unit;
                                break;
                            default:
                                newMeasurement.unit = comp.valueQuantity.unit;
                                break;
                        }
                    }

                    // Update the measurement
                    if (oldMeasurement !== null){
                        // if (oldMeasurement.getEffectiveDateTime() < newMeasurement.effectiveDateTime){
                            // updated = oldMeasurement.update(newMeasurement) || updated;
                        // } 
                        updated = this.patients[patientId].addMeasurement(new BloodPressureMeasurement(newMeasurement)) || updated;
                    } else {
                        this.patients[patientId].addMeasurement(new BloodPressureMeasurement(newMeasurement))
                        updated = true;
                    }    
                }
                if (updated){
                    console.log("New update found!");
                } else{
                    console.log("Our data is still up to date!");
                }
                return updated;
            });
    }

    /**
     * Set the limit of this monitor's systolic and diastolic blood pressure.
     * @param systolicLimit number for systolic limit
     * @param diastolicLimit number for diastolic limit
     */
    public setLimit(systolicLimit: number, diastolicLimit: number) {
        this.systolicLimit = systolicLimit;
        this.diastolicLimit = diastolicLimit;
    }


    /**
     * Remove a patient from this monitor.
     * @param patient a patient to be removed from this monitor's patients
     */
    public removePatient(ID : string) : void{
        super.removePatient(ID);
    }

    /**
     * Add a patient to be monitored.
     * @param patient a Patient object to add to this monitor's patients.
     */
    public addPatient(patient: Patient) : void{
        super.addPatient(patient);
    }

    public updateInfo(info : IBloodPressureMonitor) : boolean{
        this.diastolicLimit = info.diastolicLimit;
        this.systolicLimit = info.systolicLimit;
        return true;
    }

    public toJSON(): IBloodPressureMonitor{
        return {
            statCode : this.getStatCode(),
            systolicLimit : this.systolicLimit,
            diastolicLimit : this.diastolicLimit
        };
    }
}