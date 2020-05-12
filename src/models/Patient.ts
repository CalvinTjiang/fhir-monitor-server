/**
 * Patient of the current logged in Practitioner
 */
class Patient {
    private id: string;
    private givenName: string;
    private familyName: string;
    private birthDate: Date;
    private gender: string;
    private address: Address;
    private measurements: Array<Measurement> = [];
    
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
        for (let index:number = 0; index < this.measurements.length; index++) {
            if (this.measurements[index].getStatCode() == statCode) {
                return this.measurements[index];
            }
        }
        return null;
    }

    public addMeasurement(measurement : Measurement) : void {
        this.measurements.push(measurement);
    }
    
    public toJSON(): object {
        return {
            id: this.id,
            givenName: this.givenName, 
            familyName:this.familyName, 
            gender: this.gender, 
            address: this.address.toJSON
        };
    }
}
