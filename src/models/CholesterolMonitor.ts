/**
 * Abstract class measurement for measurements of patient's vital
 */
abstract class CholesterolMonitor extends Monitor {
    constructor(title : string){
        super(title, StatCode.TOTAL_CHOLESTEROL);
    }

    /**
     * Get the measurement data for all monitor's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public getFHIRData() : Promise<boolean>{
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
            }).then(data => {
                let newUpdate : boolean = false;

                // for each entry on the response
                for (let entry of data.entry){
                    // Get the required data and object reference
                    let resource = entry.resource;
                    let patientId : string = resource.subject.reference.slice(PATIENT);
                    let measurement : Measurement | null = patientsDictionary[patientId].getMeasurement(this.getStatCode());

                    // Compile the data as dictionary
                    let cholesterolMeasurement = {
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        totalCholesterol : resource.valueQuantity.value,
                        unit : resource.valueQuantity.unit
                    }

                    // Update the measurement
                    if (measurement !== null){
                        if (measurement.getEffectiveDateTime() < cholesterolMeasurement.effectiveDateTime){
                            newUpdate = measurement.update(cholesterolMeasurement) || newUpdate;
                        }
                    } else {
                        patientsDictionary[patientId].addMeasurement(new CholesterolMeasurement(cholesterolMeasurement))
                        newUpdate = true;
                    }
                }
                return newUpdate
            });
    }
}