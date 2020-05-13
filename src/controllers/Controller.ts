import Application from '../models/Application';
import GUI from '../views/GUI';
import ControllerObserver from './ControllerObserver';
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
        this.model.addObserver(controllerObserver);
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