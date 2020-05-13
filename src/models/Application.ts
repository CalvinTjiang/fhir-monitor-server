export default class Application extends Subject{
    private user : Practitioner | null;

    constructor() {
        super();
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
                return this.populateUserPatient(identifier) || true;
            });
    }
    
    /**
     * Get the patient data encountered by the user from FHIR server
     * @returns a promise boolean that indicate if there are any patient
     */
    private populateUserPatient(identifier : string) : Promise<boolean>{
        return fetch(`https://fhir.monash.edu/hapi-fhir-jpaserver/fhir/Encounter?participant.identifier=${this.user?.getIdentifier()}&_include=Encounter:patient&_count=200`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            }).then(data => {
                if (data.total === 0){
                    return false;
                }
                for (let entry of data.entry){
                    let resource = entry.resource;
                    if (resource.resourceType === "Patient"){
                        if (resource.deceasedDateTime === undefined){
                            let address : Address = new Address(
                                resource.address.city,
                                resource.address.state,
                                resource.address.country
                            );
                            this.user?.addPatient(new Patient(
                                resource.id,
                                resource.name[0].given,
                                resource.name[0].family,
                                new Date(resource.birthDate),
                                resource.gender,
                                address
                            ))
                        }
                    }
                }
                return true;
        })
    }

    /**
     * Get the measurement data for an monitor (specified by the StatCode) from FHIR Server
     * @returns a promise boolean that indicate if any update has occurs
     */
    public update(statCode:StatCode) : Promise<boolean>{
        if (this.user !== null){
            let monitor : Monitor | null = this.user.getMonitor(statCode)
            if (monitor !== null) {
                return monitor.getFHIRData();
            }
        }
        return new Promise(response =>{
            return false
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