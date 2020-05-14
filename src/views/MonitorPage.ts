import ejs from "ejs";
import { IMonitor } from "../models/Monitor";
import { IPractitioner } from "../models/Practitioner";
import StatCode from "../models/StatCode";

export default class MonitorPage{
    private resourcePath : string;
    private statCode: StatCode;
    constructor(resourcePath : string, statCode : StatCode){
        this.resourcePath = __dirname + resourcePath;
        this.statCode = statCode;
    }

    /**
     * Get this Measurement's statCode.
     * @returns this method returns this Measurement's statCode
     */
    public getStatCode() : StatCode {
        return this.statCode;
    }

    /**
     * Get the monitored patients list page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IMonitor object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public listPage(user : IPractitioner, monitor : Array<IMonitor>): Promise<string>{
        return ejs.renderFile(
            this.resourcePath, {
                user : user,
                statCode : this.statCode, 
                db : monitor
            })
    }

    /**
     * Get the monitor patients selection page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IMonitor object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public selectionPage(user : IPractitioner, monitor : Array<IMonitor>): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/monitor-selection.html", {
                user : user,
                statCode : this.statCode, 
                db : monitor
            });
    }

    /**
     * Get the monitor setting page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @returns a Promise object that will return the HTML data in string form
     */
    public settingPage(user : IPractitioner): Promise<string>{
        return ejs.renderFile(
            __dirname + "/resources/monitor-setting.html", {
                user : user,
                statCode : this.statCode
            })
    }
}