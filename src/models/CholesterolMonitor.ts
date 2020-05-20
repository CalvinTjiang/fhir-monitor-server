import Monitor, { IMonitor } from "./Monitor";
import fetch from "node-fetch";
import StatCode from "./StatCode";
import Patient from "./Patient";
import Measurement from "./Measurement";
import CholesterolMeasurement, { ICholesterolMeasurement } from "./CholesterolMeasurement";

export interface ICholesterolMonitor extends IMonitor{
    averageTotalCholesterol : number
}

/**
 * Abstract class measurement for measurements of patient's vital
 */
export default class CholesterolMonitor extends Monitor {
    private averageTotalCholesterol : number = 0;

    constructor(){
        super(StatCode.TOTAL_CHOLESTEROL);
    }

    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public getFHIRData() : Promise<boolean>{
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

                    // Compile the data as dictionary
                    let newMeasurement = {
                        statCode: this.getStatCode(),
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        totalCholesterol : resource.valueQuantity.value,
                        unit : resource.valueQuantity.unit
                    }

                    // Update the measurement
                    if (oldMeasurement !== null){
                        if (oldMeasurement.getEffectiveDateTime() < newMeasurement.effectiveDateTime){
                            updated = oldMeasurement.update(newMeasurement) || updated;
                        } 
                    } else {
                        this.patients[patientId].addMeasurement(new CholesterolMeasurement(newMeasurement))
                        updated = true;
                    }    
                }
                if (updated){
                    console.log("New update found!");
                } else{
                    console.log("Our data is still up to date!");
                }
                this.calculateAverageTotalCholesterol();
                return updated;
            });
    }

    public calculateAverageTotalCholesterol() : void{
        let newAverageTotalCholesterol = 0
        for (let patient of Object.values(this.patients)){
            let measurement : Measurement | null = patient.getMeasurement(this.getStatCode());
            if (measurement !== null){
                newAverageTotalCholesterol += (measurement.toJSON() as ICholesterolMeasurement)["totalCholesterol"];
            }
        }
        newAverageTotalCholesterol /= Object.values(this.patients).length;
        if (this.averageTotalCholesterol != newAverageTotalCholesterol){
            console.log(`New Average Total Cholesterol ${newAverageTotalCholesterol}\n`);
            this.averageTotalCholesterol = newAverageTotalCholesterol;
            this.notify();
        }
        
    }

    /**
     * Remove a patient from this monitor.
     * @param patient a patient to be removed from this monitor's patients
     */
    public removePatient(patient : Patient) : void{
        delete this.patients[patient.getId()];
        this.calculateAverageTotalCholesterol();
    }

    /**
     * Add a patient to be monitored.
     * @param patient a Patient object to add to this monitor's patients.
     */
    public addPatient(patient: Patient) : void{
        this.patients[patient.getId()] = patient;
        this.calculateAverageTotalCholesterol();
    }

    public toJSON(): ICholesterolMonitor{
        return {
            statCode : this.getStatCode(),
            averageTotalCholesterol : this.averageTotalCholesterol
        };
    }
}