import Monitor from "./Monitor";
import fetch from "node-fetch";
import StatCode from "./StatCode";
import Patient from "./Patient";
import Measurement from "./Measurement";
import CholesterolMeasurement from "./CholesterolMeasurement";

/**
 * Abstract class measurement for measurements of patient's vital
 */
export default class CholesterolMonitor extends Monitor {
    constructor(title : string){
        super(title, StatCode.TOTAL_CHOLESTEROL);
        this.update()
    }

    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public getFHIRData() : Promise<boolean>{
        if (this.patients.size === 0) {
            return new Promise((result)=>false);
        }
        let PATIENT = "Patient/".length;
        let patientString : string = "";
        let patientsDictionary : {[id : string]: Patient} = {}; // this is a dictionary notation for typscript
        for (let value of this.patients.entries()){
            let patient : Patient= value[0];

            patientsDictionary[patient.getId()] = patient;

            // Construct the querystring for patient
            if (patientString.length !== 0){
                patientString =  patientString + ",";
            }
            patientString = patientString + patient.getId();
        }

        // Get the observation data for the statCode
        return fetch(`https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Observation?_count=1000&code=${this.getStatCode()}&patient=${patientString}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).catch((error)=>{
                console.log(error)
            }).then(data => {
                if (data.total === 0){
                    return false
                }
                let newUpdate : boolean = false;
                let totalCholesterol : number = 0;
                let totalMeasurement : number = 0;
                // for each entry on the response
                for (let entry of data.entry){
                    // Get the required data and object reference
                    let resource = entry.resource;
                    let patientId : string = resource.subject.reference.slice(PATIENT);
                    let measurement : Measurement | null = patientsDictionary[patientId].getMeasurement(this.getStatCode());

                    // Compile the data as dictionary
                    let cholesterolMeasurement = {
                        statCode: this.getStatCode(),
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        totalCholesterol : resource.valueQuantity.value,
                        unit : resource.valueQuantity.unit,
                        isAboveAverage : false
                    }

                    // Update the measurement
                    if (measurement !== null){
                        if (measurement.getEffectiveDateTime() < cholesterolMeasurement.effectiveDateTime){
                            newUpdate = measurement.update(cholesterolMeasurement) || newUpdate;
                            totalCholesterol += cholesterolMeasurement.totalCholesterol;
                            totalMeasurement += 1;
                        }
                    } else {
                        patientsDictionary[patientId].addMeasurement(new CholesterolMeasurement(cholesterolMeasurement))
                        newUpdate = true;
                        totalCholesterol += cholesterolMeasurement.totalCholesterol;
                        totalMeasurement += 1;
                    }
                }
                if (totalMeasurement === 0){
                    CholesterolMeasurement.setAverage(0);
                }else{
                    CholesterolMeasurement.setAverage(totalCholesterol/totalMeasurement);
                }
                return newUpdate
            });
    }
}