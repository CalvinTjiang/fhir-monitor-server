import StatCode from "./StatCode";
import Monitor from "./Monitor";
import CholesterolMonitor from "./CholesterolMonitor";
import Patient from "./Patient";
import BloodPressureMonitor from "./BloodPressureMonitor";

/**
 *  class Monitors which are aggregate of monitor
 */
export default class Monitors {
    private monitors: {[statCode: string]: Monitor} = {};

    /**
     * Add a monitor to this monitors.
     * @param monitor a Monitor object to add to this Practitioner monitors array.
     */
    public addMonitor(statCode: StatCode): void {
        switch (statCode) {
            case(StatCode.TOTAL_CHOLESTEROL):
                this.monitors[statCode] = new CholesterolMonitor();
                break;

            case(StatCode.BLOOD_PRESSURE):
                this.monitors[statCode] = new BloodPressureMonitor();
                break;
                
            default:
                break;
        }
    }

    /**
     * Get the monitor with the specified statCode.
     * @param statCode a statCode enumeration
     * @returns this method returns a Monitor if the statCode exists, null otherwise.
     */
    public getMonitor(statCode: StatCode): Monitor | null{
        return this.monitors[statCode];
    }

    /**
     * Remove a monitor with the specified statCode from the Practitioner.
     * @param statCode a statCode enumeration
     */
    public removeMonitor(statCode: StatCode): void{
        delete this.monitors[statCode];
    }

    /**
     * Add a patient to be monitored by a monitor (specified by the statCode).
     * @param statCode a statCode enumeration
     * @param patient a Patient object
     */
    public addMonitoredPatient(statCode:StatCode, patient:Patient) {
        let monitor:Monitor | null = this.getMonitor(statCode);
        if (monitor) {
            monitor.addPatient(patient);
        }
    }

    /**
     * Remove a patient (specified by the ID) from a monitor (specified by the statCode).
     * @param statCode a statCode enumeration
     * @param ID a string represent the patient's ID
     */
    public removeMonitoredPatient(statCode:StatCode, ID:string) {
        let monitor:Monitor | null = this.getMonitor(statCode);
        if (monitor) {
            monitor.removePatient(ID);
        }
    }
}