import StatCode from "./StatCode";
import Measurement from "./Measurement";
import Address, { IAddress } from "./Address";
import Measurements from "./Measurements";

export interface IPatient{
    id: string,
    givenName: string, 
    familyName: string,
    birthDate: Date, 
    gender: string, 
    address: IAddress
}

/**
 * Patient of the current logged in Practitioner
 */
export default class Patient {
    private id: string;
    private givenName: string;
    private familyName: string;
    private birthDate: Date;
    private gender: string;
    private address: Address;
    // private measurements: Array<Measurement> = [];
    private measurements: Measurements = new Measurements();
    
    constructor(id: string, givenName: string, familyName: string, birthDate: Date, gender: string, address:Address) {
        this.id = id;
        this.givenName = givenName;
        this.familyName = familyName;
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
    }

    /**
     * getId
     */
    public getId(): string {
        return this.id;
    }
    /**
     * getGivenName
     */
    public getGivenName(): string {
        return this.givenName; 
    }
    
    /**
     * getFamilyName
     */
    public getFamilyName(): string {
        return this.familyName; 
    }

    /**
     * getAddress
     */
    public getAddress(): Address {
        return this.address; 
    }

    /**
     * Get patient's measurement with the specified statCode.
     * @param statCode a statCode enumeration
     * @returns this method returns a Measurement if the statCode exists, null otherwise.
     */
    public getMeasurement(statCode: StatCode) : Measurement | null{
        // for (let index:number = 0; index < this.measurements.length; index++) {
        //     if (this.measurements[index].getStatCode() == statCode) {
        //         return this.measurements[index];
        //     }
        // }
        // return null;
        return this.measurements.getLatestMeasurement(statCode);
    }

    /**
     * Add measurement to Patient
     * @param measurement new Measurement to be added
     */
    public addMeasurement(measurement : Measurement) : boolean {
        // this.measurements.push(measurement);
        return this.measurements.addMeasurement(measurement);
    }
    
    public toJSON(): IPatient {
        return {
            id: this.id,
            birthDate: this.birthDate,
            givenName: this.givenName, 
            familyName:this.familyName, 
            gender: this.gender, 
            address: this.address.toJSON()
        };
    }
}
