import fetch from "node-fetch";
import Monitor, { IMonitor } from "./Monitor";
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
    private patients: Array<Patient>;
    private monitors: Array<Monitor>;
    private name : string;
    private email : string;
    constructor(identifier: string, name : string, email : string) {
        this.identifier = identifier;
        this.name = name;
        this.email = email
        this.patients = [];
        this.monitors = [];
    }

    /**
     * Get the patient data encountered by the user from FHIR server
     * @returns a promise boolean that indicate if there are any patient
     */
    public getFHIRPatient(link : string) : Promise<boolean>{
        if (link.length === 0){
            link = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Encounter?participant.identifier=${this.identifier}&_include=Encounter:patient&_count=200`
        }
        return fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).catch((error)=>{
                console.log(error);
            }).then(data => {
                if (data.resourceType === "OperationOutcome"){
                    return false;
                }
                if (data.total === 0){
                    return false;
                }
                for (let entry of data.entry){
                    let resource = entry.resource;
                    if (resource.resourceType === "Patient"){
                        if (resource.deceasedDateTime === undefined){
                            let address : Address = new Address(
                                resource.address[0].city,
                                resource.address[0].state,
                                resource.address[0].country
                            );
                            this.patients.push(new Patient(
                                resource.id,
                                resource.name[0].given[0],
                                resource.name[0].family,
                                new Date(resource.birthDate),
                                resource.gender,
                                address
                            ))
                        }
                    }
                }

                for (let link of data.link){
                    if (link.relation === "next"){
                        return this.getFHIRPatient(link.url) || true;
                    }
                }
                return true;
        })
    }

    /**
     * Get the measurement data for all practioner's patient from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public getFHIRPatientMeasurement(statCode : StatCode, link : string) : Promise<boolean>{
        if (this.patients.length === 0) {
            return new Promise((result)=>false);
        }
        
        let PATIENT = "Patient/".length;
        let patientString : string = "";
        let patientsDictionary : {[id : string]: Patient} = {}; // this is a dictionary notation for typscript
        for (let patient of this.patients){
            patientsDictionary[patient.getId()] = patient;

            // Construct the querystring for patient
            if (patientString.length !== 0){
                patientString =  patientString + "%2C";
            }
            patientString = patientString + patient.getId();
        }
        if (link.length === 0){
            link = `https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Observation?code=${statCode}&patient=${patientString}&_count=200`;
        }

        // Get the observation data for the statCode
        return fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).catch((error)=>{
                console.log(error)
                return {
                    total : 0
                }
            }).then((data)=>{
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
                    let measurement : Measurement | null = patientsDictionary[patientId].getMeasurement(statCode);

                    // Compile the data as dictionary
                    let cholesterolMeasurement = {
                        statCode: statCode,
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

                for (let link of data.link){
                    if (link.relation === "next"){
                        return this.getFHIRPatientMeasurement(statCode, link.url) || newUpdate;
                    }
                }
                return newUpdate
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
        return this.patients;
    }

    public getPatient(ID: string): Patient | null{
        for (let i:number = 0; i < this.patients.length; i ++) {
            if (this.patients[i].getId() == ID) {
                return this.patients[i];
            }
        }
        return null;
    }

    /**
     * Get the patient details and measurement detail
     * @param statCode a statCode enumeration
     * @returns array of object that contain the patient and measurement details.
     */
    public getPatientsWithMeasurement(statCode : StatCode) : Array<IMonitor>{
        let copyPatients : Array<IMonitor> = [];
        for (let patient of this.patients){
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
        }
        return copyPatients;
    }

    /**
     * Add a monitor to this Practitioner.
     * @param monitor a Monitor object to add to this Practitioner monitors array.
     */
    public addMonitor(statCode: StatCode): void {
        switch (statCode) {
            case(StatCode.TOTAL_CHOLESTEROL):
                this.monitors.push(new CholesterolMonitor("Cholesterol Monitor"));
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