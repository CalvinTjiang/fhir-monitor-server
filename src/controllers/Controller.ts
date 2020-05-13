import Application from '../models/Application';
import GUI from '../views/GUI';
import ControllerObserver from './ControllerObserver';
import { IPractitioner } from '../models/Practitioner';
import { IMonitor } from '../models/Monitor';
import MonitorPage from '../views/MonitorPage';
/**
 * Controller class for managing input from user
 * 
 */
class Controller {
    private model: Application;
    private view: GUI;
    private observers: Array<ControllerObserver>;

    constructor(model: Application, view: GUI, socket:any) {
        this.model = model;
        this.view = view;
        this.observers = new Array<ControllerObserver>();

        // create a new observer
        let controllerObserver:ControllerObserver = new ControllerObserver(StatCode.TOTAL_CHOLESTEROL, socket);
        this.model.addObserver(StatCode.TOTAL_CHOLESTEROL, controllerObserver);
        
        this.observers.push(controllerObserver);
        this.view.addMonitorPage(new MonitorPage(__dirname + "/resources/cholesterol-monitor.html", StatCode.TOTAL_CHOLESTEROL))
    }

    /**
     * Validate the ID of practitioner, open the patien list page if the Practitioner exists
     * @param ID string ID of practitioner
     */
    public validateId(ID: string): Promise<boolean> {
        return this.model.validateID(ID);
    }

    /**
     * Get the login page
     * @returns a Promise object that will return the HTML data in string form
     */
    public loginPage() : Promise<string> {
        return this.view.loginPage();
    }

    /**
     * Get the patient details and measurement detail
     * @param statCode a statCode enumeration
     * @returns array of object that contain the patient and measurement details.
     */
    public indexPage() : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let patients: Array<IPatient> | undefined = this.model.getUser()?.getPatients().map(patient => patient.toJSON());
        if (user !== undefined && patients !== undefined){
            if (patients !== undefined){
                return this.view.indexPage(user, patients);
            }
            return this.view.noPatientPage(user);
        }
        return this.loginPage();
    }

    /**
     * Get the patient details page
     * @param ID a string that represent the patient id
     * @returns a Promise object that will return the HTML data in string form
     */
    public patientPage(ID: string) : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let patient: IPatient | undefined = this.model.getUser()?.getPatient(ID)?.toJSON();
        if (user !== undefined){
            if (patient !== undefined){
                return this.view.patientPage(user, patient);
            }
            return this.notFoundPage();
        }
        return this.loginPage();
    }

    /**
     * Get the monitored patients list page
     * @param statCode statCode enumeration for selecting monitor
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorListPage(statCode: StatCode) : Promise<string>{
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let monitor: Array<IMonitor> | undefined = this.model.getUser()?.getMonitor(statCode)?.getPatientsWithMeasurement();
        if (user !== undefined && monitor !== undefined){
            if (monitor !== undefined){
                return this.view.monitorListPage(statCode, user, monitor);
            }
            return this.view.noPatientPage(user);
        }
        return this.loginPage();
    }

    /**
     * Get the monitored patients selection page
     * @param statCode statCode enumeration for selecting monitor
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorSelectionPage(statCode: StatCode) : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let monitor: Array<IMonitor> | undefined = this.model.getUser()?.getPatientsWithMeasurement(statCode);
        if (user !== undefined && monitor !== undefined){
            if (monitor !== undefined){
                return this.view.monitorSelectionPage(statCode, user, monitor);
            }
            return this.view.noPatientPage(user);
        }
        return this.loginPage();
    }

    /**
     * Get the monitor setting page
     * @param statCode statCode enumeration for selecting monitor
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorSettingPage(statCode: StatCode) : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        if (user !== undefined ){
            return this.view.monitorSettingPage(statCode, user);
        }
        return this.loginPage();
    }

    /**
     * Get the error 404 : not found page
     * @returns a Promise object that will return the HTML data in string form
     */
    public notFoundPage() : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        if (user !== undefined ){
            return this.view.notFoundPage(user);
        }
        return this.loginPage();
    }

    /**
     * Create a new Monitor
     * @param statCode statCode of new Monitor
     */
    public addMonitor(statCode: StatCode) : void {
        this.model.addMonitor(statCode);
    }

    /**
     * Add a patient to a monitor
     * @param statCode statcode of monitor
     * @param ID ID of patient
     */
    public addMonitoredPatient(statCode: StatCode, ID: string) : void{
        this.model.addMonitoredPatient(statCode, ID);
    }

    /**
     * Remove a patient form a monitor
     * @param statCode statcode of monitor
     * @param ID id of patient
     */
    public removeMonitoredPatient(statCode:StatCode, ID:string) : void{
        this.model.removeMonitoredPatient(statCode, ID);
    }

}