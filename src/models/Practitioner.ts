/**
 * The currently logged in Practitioner
 */
class Practitioner {
    private identifier: string;
    private patients: Array<Patient>;
    private monitors: Array<Monitor>;

    constructor(identifier: string) {
        this.identifier = identifier;
        this.patients = [];
        this.monitors = [];
    }

    /**
     * Get practitioner's identifier.
     * @returns returns the practitioner's identifier.
     */
    public getIdentifier(): string{
        return this.identifier;
    }


    /**
     * Add a patient to this Practitioner.
     * @param patient a Patient object to add to this practitioner patients list
     */
    public addPatient(patient: Patient): void {
        this.patients.push(patient);
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
     * Add a monitor to this Practitioner.
     * @param monitor a Monitor object to add to this Practitioner monitors array.
     */
    public addMonitor(statCode: StatCode): void {
        switch (statCode) {
            case(StatCode.TOTAL_CHOLESTEROL):
                this.monitors.push(new CholesterolMonitor("Cholesterol Monitor"));
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
            if (this.monitors[index].getStatCode() == statCode) {
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
}