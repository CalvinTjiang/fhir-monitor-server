/**
 * Address of a patient
 */
class Address {
    private city: string;
    private state: string;
    private country: string;

    constructor(city: string, state:string, country:string) {
        this.city = city;
        this.state = state;
        this.country = country;
    }

    public toJSON(): object {
        return {city: this.city, state: this.state, country: this.country};
    }
}