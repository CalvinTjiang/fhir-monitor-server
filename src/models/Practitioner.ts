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
     * Add a patient to this Practitioner.
     * @param patient a Patient object to add to this practitioner patients list
     */
    public addPatient(patient: Patient): void {
        this.patients.push(patient);
    }

    /**
     * Add a monitor to this Practitioner.
     * @param monitor a Monitor object to add to this Practitioner monitors array.
     */
    public addMonitor(monitor: Monitor): void {
        this.monitors.push(monitor);
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

    /**
     * Register a patient to a monitor
     * @param monitor a monitor which the patient will be registered to
     * @param patient the patient which will be registered to the monitor
     */
    public registerMonitoredPatient(monitor: Monitor, patient:Patient): void {
        monitor.addPatient(patient);
    }


}