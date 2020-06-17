import fetch from "node-fetch";
import Monitor, { IMonitorPair } from "./Monitor";
import CholesterolMonitor from "./CholesterolMonitor";
import StatCode from "./StatCode";
import Patient from "./Patient";
import Measurement from "./Measurement";
import CholesterolMeasurement from "./CholesterolMeasurement";
import Address from "./Address";

export interface IPractitioner{
    identifier : string,
    name : string,
    email : string
}
/**
 * The currently logged in Practitioner
 */
export default class Practitioner {
    private identifier: string;
    // private patients: Array<Patient>;
    private patients: {[id: string]: Patient};
    private monitors: Array<Monitor>;
    private name : string;
    private email : string;
    constructor(identifier: string, name : string, email : string) {
        this.identifier = identifier;
        this.name = name;
        this.email = email
        // this.patients = [];
        this.patients = {};
        this.monitors = [];
    }

    /**
     * Get the patient data encountered by the user from FHIR server
     * @returns a promise boolean that indicate if this Practitioner has any patient
     */
    public getFHIRPatient(link : string) : Promise<boolean>{
        // first time calling the function, the link is predetermined
        if (link.length === 0){
            link = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Encounter?participant.identifier=${this.identifier}&_include=Encounter:patient&_count=200`;
        }

        console.log(`Getting Patients from link: ${link}`);

        //fetch link data
        return fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).then(data => {
                if (data.resourceType === "OperationOutcome"){
                    console.log('ResourceType is OperationOutcome');
                    return false;
                }
                if (data.total === 0){
                    return false;
                }
                let totalPatient:number = 0;
                for (let entry of data.entry){
                    let resource = entry.resource;
                    if (resource.resourceType === "Patient"){
                        if (resource.deceasedDateTime === undefined){
                            totalPatient++;
                            this.patients[resource.id] = (new Patient(
                                resource.id,
                                resource.name[0].given[0],
                                resource.name[0].family,
                                new Date(resource.birthDate),
                                resource.gender,
                                new Address(
                                    resource.address[0].city,
                                    resource.address[0].state,
                                    resource.address[0].country
                                )
                            ))
                        }
                    }
                }
                console.log(`${totalPatient} New living patient(s) found!\n`);
                // get the next page of result by looking through links
                for (let link of data.link){
                    if (link.relation === "next"){
                        return this.getFHIRPatient(link.url) || true;
                    }
                }
                return true;
            }).catch((error)=>{
                console.log(error);
                return false;
            })
    }

    /**
     * Get the measurement data for all practioner's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public getFHIRPatientMeasurement(statCode : StatCode, link : string) : Promise<boolean>{
        let PATIENT = "Patient/".length;
        let patientString : string = "";

        // construct query string for link to search for Observations
        Object.keys(this.patients).forEach(id => {
            if (patientString.length !== 0) {
                patientString += "%2C";
            }
            patientString += id;
        });
        if (link.length === 0){
            link = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Observation?code=${statCode}&patient=${patientString}&_count=200`;
        }

        console.log(`Fetching Patient Measurements from link : ${link}\n`);

        // Get the observation data for the statCode
        return fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).then((data)=>{
                // return false if all patients does not have Observation data with the StatCode
                if (data.total === 0){
                    return false
                }

                // flag to indicate if any of the new observations are new
                let updated : boolean = false; 

                let totalStored:number = 0;
                let totalUpdated:number = 0;
                // for each entry on the Observations response
                for (let entry of data.entry) {
                    // console.log(`Measurement with statCode ${statCode} is found for patient ${entry.resource.subject.reference.slice(PATIENT)}`);
                    // Get the required data and object reference
                    let resource = entry.resource;
                    let patientId : string = resource.subject.reference.slice(PATIENT);
                    let oldMeasurement : Measurement | null = this.patients[patientId].getMeasurement(statCode);

                    // Compile the measurements as an object
                    let newMeasurement = {
                        statCode: statCode,
                        effectiveDateTime : new Date(resource.effectiveDateTime),
                        totalCholesterol : resource.valueQuantity.value,
                        unit : resource.valueQuantity.unit
                    }

                    // Update the measurement if the patient has previous measurement, if not add ne measurement
                    if (oldMeasurement !== null){
                        if (oldMeasurement.getEffectiveDateTime() < newMeasurement.effectiveDateTime){
                            updated = oldMeasurement.update(newMeasurement) || updated;
                            totalUpdated++;
                        }
                    } else {
                        this.patients[patientId].addMeasurement(new CholesterolMeasurement(newMeasurement))
                        updated = true;
                        totalStored++;
                    }
                }

                console.log(`${totalStored} new measurement(s) are stored!`);
                console.log(`${totalUpdated} measurement(s) are updated!\n`);

                for (let link of data.link){
                    if (link.relation === "next"){
                        return this.getFHIRPatientMeasurement(statCode, link.url) || updated;
                    }
                }
                return updated;

            }).catch((error)=>{
                console.log(error);
                return false;
            });
    }
    
    /**
     * Get practitioner's identifier.
     * @returns returns the practitioner's identifier.
     */
    public getIdentifier(): string{
        return this.identifier;
    }

    /**
     * Get practitioner's patients.
     * @returns returns all practitioner's patients.
     */
    public getPatients(): Array<Patient>{
        let patientsArray: Array<Patient> = [];
        Object.keys(this.patients).forEach(id => {
            let patient:Patient = this.patients[id];
            patientsArray.push(patient);
        });
        return patientsArray;
    }

    public getPatient(ID: string): Patient | null{
        return this.patients[ID];
    }


    /**
     * Get the patient details and measurement detail
     * @param statCode a statCode enumeration
     * @returns array of object that contain the patient and measurement details.
     */
    public getPatientsWithMeasurement(statCode : StatCode) : Array<IMonitorPair>{
        let copyPatients : Array<IMonitorPair> = [];
        Object.keys(this.patients).forEach(id => {
            let patient:Patient = this.patients[id];
            let measurement : Measurement | null = patient.getMeasurement(statCode);
            if (measurement === null){
                copyPatients.push({
                    patient : patient.toJSON(), 
                    measurement : measurement
                });
            } else {
                copyPatients.push({
                    patient : patient.toJSON(), 
                    measurement : measurement.toJSON()
                });
            }
        });
        return copyPatients;
    }

    /**
     * Add a monitor to this Practitioner.
     * @param monitor a Monitor object to add to this Practitioner monitors array.
     */
    public addMonitor(statCode: StatCode): void {
        switch (statCode) {
            case(StatCode.TOTAL_CHOLESTEROL):
                this.monitors.push(new CholesterolMonitor());
                break;
            default:
                break;
        }
    }

    /**
     * Get practitioner's monitor with the specified statCode.
     * @param statCode a statCode enumeration
     * @returns this method returns a Monitor if the statCode exists, null otherwise.
     */
    public getMonitor(statCode: StatCode): Monitor | null{
        for (let index:number = 0; index < this.monitors.length; index++) {
            if (this.monitors[index].getStatCode() === statCode) {
                return this.monitors[index];
            }
        }
        return null;
    }

    /**
     * Remove a monitor with the specified statCode from the Practitioner.
     * @param statCode a statCode enumeration
     */
    public removeMonitor(statCode: StatCode): void{
        for (let index:number = 0; index < this.monitors.length; index++) {
            if (this.monitors[index].getStatCode() == statCode) {
                this.monitors.splice(index, 1);
            }
        }
    }

    public addMonitoredPatient(statCode:StatCode, ID:string) {
        let monitor:Monitor | null = this.getMonitor(statCode);
        let patient:Patient | null = this.getPatient(ID);
        if (monitor && patient) {
            monitor.addPatient(patient);
        }
    }

    public removeMonitoredPatient(statCode:StatCode, ID:string) {
        let monitor:Monitor | null = this.getMonitor(statCode);
        let patient:Patient | null = this.getPatient(ID);

        if (monitor && patient) {
            monitor.removePatient(patient);
        }
    }

    public toJSON() : IPractitioner{
        return {
            identifier : this.identifier,
            name : this.name,
            email : this.email
        };
    }
}