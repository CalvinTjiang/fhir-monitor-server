import Practitioner from "./Practitioner";
import Observer from "../observers/Observer";
import fetch from "node-fetch";

export default class Application{
    private user : Practitioner | null;
    constructor() {
        this.user = null;
    }

     /**
     * Validate the id, if practitioner exist, get the identifier and create the Practitioner object.
     * @param ID a string represent the id of the user
     * @returns a promise boolean that indicate if tany practitioner with input ID exist.
     */
    public validateID(ID : string) : Promise<boolean>{
        return fetch(`https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Practitioner?_id=${ID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).then(data => {
                if (data.total === 0){
                    return false;
                }
                // Implement checking
                let entry = data.entry[0];
                let identifier : string = entry.identifier[0].system + "|" + entry.identifier[0].value;
                this.user = new Practitioner(identifier);
                return this.user.getFHIRPatient()
                    .then((res : boolean)=>{
                        return this.user?.getFHIRPatientMeasurement(StatCode.TOTAL_CHOLESTEROL) || res;
                    })
            });
    }

    /**
     * Get the application's user.
     * @returns returns the application's user.
     */
    public getUser() : Practitioner | null{
        return this.user;
    }

    /**
     * Add a monitor with the specified statcode to current user
     * @param statCode statcode of the new monitor
     */
    public addMonitor(statCode: StatCode) {
        this.user?.addMonitor(statCode);
    }

    /**
     * Add a observer to certain monitor
     * @param statCode statcode of the new monitor
     */
    public addObserver(statCode: StatCode, observer : Observer) {
        this.user?.getMonitor(statCode)?.addObserver(observer);
    }


    /**
     * Add a Patient to a monitor
     * @param statCode the type of monitor
     * @param ID id of the patient to add to the monitor
     */
    public addMonitoredPatient(statCode:StatCode, ID:string) {
        this.user?.addMonitoredPatient(statCode, ID);
    }

    /**
     * Remove a Patient to a monitor
     * @param statCode the type of monitor
     * @param ID id of the patient to add to the monitor
     */
    public removeMonitoredPatient(statCode:StatCode, ID:string) {
        this.user?.removeMonitoredPatient(statCode, ID);
    }
}