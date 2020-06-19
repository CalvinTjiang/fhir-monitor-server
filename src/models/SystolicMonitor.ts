import fetch from "node-fetch";
import Monitor, { IMonitor } from "./Monitor";
import StatCode from "./StatCode";
import Patient from "./Patient";
import SystolicMeasurement from "./SystolicMeasurement";

export interface ISystolicMonitor extends IMonitor{
    systolicLimit : number
}

/**
 * Abstract class measurement for measurements of patient's vital
 */
export default class SystolicMonitor extends Monitor {
    private systolicLimit : number = 0;

    constructor(){
        super(StatCode.SYSTOLIC_BLOOD_PRESSURE);
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

        let link : string = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Observation?_count=1000&code=${StatCode.BLOOD_PRESSURE}&patient=${patientString}`;

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

                    let newMeasurement = {
                        statCode: this.getStatCode(),
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        systolic : 0,
                        unit : ""
                    }
                    for (let comp of resource.component) {
                        switch (comp.code.coding[0].code) {
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
                    updated = this.patients[patientId].addMeasurement(new SystolicMeasurement(newMeasurement)) || updated;
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
    public setLimit(systolicLimit: number) {
        this.systolicLimit = systolicLimit;
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
    
    public updateInfo(info : ISystolicMonitor) : boolean{
        this.systolicLimit = info.systolicLimit;
        return true;
    }

    public toJSON(): ISystolicMonitor{
        return {
            statCode : this.getStatCode(),
            systolicLimit : this.systolicLimit
        };
    }
}