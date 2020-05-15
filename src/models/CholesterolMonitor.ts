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
        // console.log("New monitor created");
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
                //total cholesterol and total measurement to countAverage
                let totalCholesterol : number = 0;
                let totalMeasurement : number = 0;

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
                        unit : resource.valueQuantity.unit,
                        isAboveAverage : false
                    }

                    // Update the measurement
                    if (oldMeasurement !== null){
                        if (oldMeasurement.getEffectiveDateTime() < newMeasurement.effectiveDateTime){
                            updated = oldMeasurement.update(newMeasurement) || updated;
                            totalCholesterol += newMeasurement.totalCholesterol;
                            totalMeasurement += 1;
                        }
                    } else {
                        this.patients[patientId].addMeasurement(new CholesterolMeasurement(newMeasurement))
                        updated = true;
                        totalCholesterol += newMeasurement.totalCholesterol;
                        totalMeasurement += 1;
                    }    
                }
                // console.log(`Refreshed monitor result ${updated}`);
                // console.log(`    found data: ${data.total}`)

                if (totalMeasurement === 0) {
                    CholesterolMeasurement.setAverage(0);
                } else {
                    CholesterolMeasurement.setAverage(totalCholesterol/totalMeasurement);
                }

                return updated
            });
    }
}