import ejs from "ejs";
import { IMonitorPair, IMonitor } from "../models/Monitor";
import { IPractitioner } from "../models/Practitioner";
import StatCode from "../models/StatCode";
import ListType from "./ListType";

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
     * @param monitor an Array of IMonitorPair object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public listPage(listType : ListType, user : IPractitioner, monitor : Array<IMonitorPair>, monitorInfo : IMonitor): Promise<string>{
        switch(listType){
            case ListType.TABLE:
                return ejs.renderFile(
                    this.resourcePath + "table.html", {
                        user : user,
                        statCode : this.statCode, 
                        db : monitor,
                        info : monitorInfo
                    })
            
            case ListType.GRAPH:
                return ejs.renderFile(
                    this.resourcePath + "graph.html", {
                        user : user,
                        statCode : this.statCode, 
                        db : monitor,
                        info : monitorInfo
                    })

            case ListType.TEXTUAL:
                return ejs.renderFile(
                    this.resourcePath + "textual.html", {
                        user : user,
                        statCode : this.statCode, 
                        db : monitor,
                        info : monitorInfo
                    })

            default:
                return ejs.renderFile(
                    this.resourcePath + "table.html", {
                        user : user,
                        statCode : this.statCode, 
                        db : monitor,
                        info : monitorInfo
                    })
        }
    }

    /**
     * Get the monitor patients selection page
     * @param statCode statCode enumeration for selecting monitor
     * @param user an IPractitioner object that contain the currently logged in user data
     * @param monitor an Array of IMonitorPair object that contain the details of patient and its measurement according to statCode
     * @returns a Promise object that will return the HTML data in string form
     */
    public selectionPage(user : IPractitioner, monitor : Array<IMonitorPair>): Promise<string>{
        return ejs.renderFile(
            this.resourcePath + "selection.html", {
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
    public settingPage(user : IPractitioner, interval : number, monitorInfo : IMonitor): Promise<string>{
        return ejs.renderFile(
            this.resourcePath + "setting.html", {
                user : user,
                statCode : this.statCode,
                interval : interval,
                info : monitorInfo
            })
    }
}