import ejs from "ejs";
import MonitorPage from "./MonitorPage";
import { IPractitioner } from "../models/Practitioner";
import { IMonitorPair, IMonitor } from "../models/Monitor";
import StatCode from "../models/StatCode";
import { IPatient } from "../models/Patient";

export default class GUI{
    private monitorPages : Array<MonitorPage>;
    constructor(){
        this.monitorPages = new Array<MonitorPage>();
    }

    public addMonitorPage(monitorPage : MonitorPage){
        this.monitorPages.push(monitorPage)
    }

    /**
     * Get the login page
     * @returns a Promise object that will return the HTML data in string form
     */
    public loginPage() : Promise<string>{
        return ejs.renderFile(__dirname + "/resources/login.html", {});
    }

    /**
     * Get the index page
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IPatient object that contain the details of patient
     * @returns a Promise object that will return the HTML data in string form
     */
    public indexPage(user : IPractitioner, patients: Array<IPatient>): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/index.html", {
                user: user,
                db: patients
            });
    }

    /**
     * Get the loading page
     * @param user an IPractitioner object that contain the currently logged in user data
     * @returns a Promise object that will return the HTML data in string form
     */
    public loadingPage(user : IPractitioner): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/loading.html", {
                user: user
            });
    }
    /**
     * Get the patient details page
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an IPatient object that contain the details of patient
     * @returns a Promise object that will return the HTML data in string form
     */
    public patientPage(user : IPractitioner, patient: IPatient): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/patient-details.html", {
                user: user,
                patient: patient,
            });
    }

    /**
     * Get the monitored patients list page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IMonitorPair object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorListPage(statCode : StatCode, user : IPractitioner, monitor : Array<IMonitorPair>, monitorInfo : IMonitor | null): Promise<string>{
        if (monitorInfo !== null){
            for (let monitorPage of this.monitorPages){
                if (monitorPage.getStatCode() === statCode){
                    return monitorPage.listPage(user, monitor, monitorInfo);
                }
            }
        }
        return this.notFoundPage(user);
    }

    /**
     * Get the monitor patients selection page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IMonitorPair object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorSelectionPage(statCode : StatCode, user : IPractitioner, monitor : Array<IMonitorPair>): Promise<string>{
        for (let monitorPage of this.monitorPages){
            if (monitorPage.getStatCode() === statCode){
                return monitorPage.selectionPage(user, monitor)
            }
        }
        return this.notFoundPage(user);
    }

    /**
     * Get the monitor setting page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @returns a Promise object that will return the HTML data in string form
     */
    public monitorSettingPage(statCode : StatCode, user : IPractitioner, interval : number): Promise<string>{
        for (let monitorPage of this.monitorPages){
            if (monitorPage.getStatCode() === statCode){
                return monitorPage.settingPage(user, interval);
            }
        }
        return this.notFoundPage(user);
    }

    /**
     * Get the monitored patients selection page
     * @param user an IPractitioner object that contain the currently logged in user data
     * @returns a Promise object that will return the HTML data in string form
     */
    public noPatientPage(user : IPractitioner): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/no-patient.html", {
                user : user
            });
    }
    
    /**
     * Get the error 404 : not found page
     * @param user an IPractitioner object that contain the currently logged in user data
     * @returns a Promise object that will return the HTML data in string form
     */
    public notFoundPage(user : IPractitioner): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/not-found.html", {
                user : user
            });
    }
}