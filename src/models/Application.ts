import Practitioner from "./Practitioner";
import Observer from "../observers/Observer";
import fetch from "node-fetch";
import StatCode from "./StatCode";

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
                let resource = data.entry[0].resource
                let identifier : string = resource.identifier[0].system + "|" + resource.identifier[0].value;
                let name : string = resource.name[0].prefix[0] + " " + resource.name[0].given[0] + " " + resource.name[0].family;
                let email : string = resource.telecom[0].value;
                this.user = new Practitioner(identifier, name, email);
                this.addMonitor(StatCode.TOTAL_CHOLESTEROL);
                return this.user.getFHIRPatient("")
                    .then((res : boolean)=>{
                        if (this.user === null){
                            return false;
                        }
                        this.user.getFHIRPatientMeasurement(StatCode.TOTAL_CHOLESTEROL, "")
                        return true;
                    });
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

    /**
     * Update a certain monitor's interval update specified by the statcode
     * @param statCode statcode of monitor
     * @param interval the new interval measured in millisecond
     * @returns a boolean | undefined indicated if the interval was updated or not.
     */
    public updateMonitorInterval(statCode:StatCode, interval:number) : boolean | undefined{
        return this.user?.getMonitor(statCode)?.setUpdateInterval(interval)
    }
}