import Application from '../models/Application';
import GUI from '../views/GUI';
import ControllerObserver from './ControllerObserver';
import { IPractitioner } from '../models/Practitioner';
import { IMonitor } from '../models/Monitor';
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
        // this.model.addObserver(controllerObserver);
        this.observers.push(controllerObserver);
    }

    /**
     * Validate the ID of practitioner, open the patien list page if the Practitioner exists
     * @param ID string ID of practitioner
     */
    public validateId(ID: string) {
        this.model.validateID(ID).then((res: Boolean) => {
            if (res) {
                this.view.patientListPage();
            }
        })
    }

    public loginPage() : Promise<string> {
        return this.view.login();
    }

    public indexPage() : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let patients: Array<IPatient> | undefined = this.model.getUser()?.getPatients().map(patient => patient.toJSON());

        return this.view.indexPage(user, patients);
    }

    public patientPage(ID: string) : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let patient: IPatient | undefined = this.model.getUser()?.getPatient(ID)?.toJSON();

        return this.view.patientPage(user, patient);
    }

    public getMonitorPage(statCode: StatCode) : Promise<string>{
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let monitor: Array<IMonitor> | undefined = this.model.getUser()?.getMonitor(statCode)?.getPatientsWithMeasurement();

        return this.view.getMonitorPage(statCode, user, monitor);
    }

    public selectionPage(statCode: StatCode) : Promise<string> {
        let user: IPractitioner | undefined = this.model.getUser()?.toJSON();
        let monitor: Array<IMonitor> | undefined = this.model.getUser()?.getMonitor(statCode)?.getPatientsWithMeasurement();

        return this.view.selectionPage(statCode, user, monitor);
    }

    public notFoundPage() : Promise<string> {
        return this.view.notFoundPage();
    }

    public settingPage() : Promise<string> {
        return this.view.settingPage();
    }


    /**
     * Create a new Monitor
     * @param statCode statCode of new Monitor
     */
    public addMonitor(statCode: StatCode) {
        this.model.addMonitor(statCode);
    }

    /**
     * Add a patient to a monitor
     * @param statCode statcode of monitor
     * @param ID ID of patient
     */
    public addMonitoredPatient(statCode: StatCode, ID: string) {
        this.model.addMonitoredPatient(statCode, ID);
    }

    /**
     * Remove a patient form a monitor
     * @param statCode statcode of monitor
     * @param ID id of patient
     */
    public removeMonitoredPatient(statCode:StatCode, ID:string) {
        this.model.removeMonitoredPatient(statCode, ID);
    }

}