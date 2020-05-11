interface CholesterolMeasurementsObject {
    totalCholesterol: string
}
/**
 * A CholesterolMeasurement class with total cholesterol
 */
class CholesterolMeasurement extends Measurement {
    public totalCholesterol: number;

    constructor(totalCholesterol: number) {
        super(StatCode.TOTAL_CHOLESTEROL);
        this.totalCholesterol = totalCholesterol;
    }

    update(data: CholesterolMeasurement) {
        this.totalCholesterol = data.totalCholesterol;
    }

    toJSON() {
        return {statCode: this.statCode, totalCholesterol: this.totalCholesterol};
    }

}