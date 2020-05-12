class Subject {
    private observers : Set<Observer>;

    constructor(){
        this.observers = new Set<Observer>();
    }

    /**
     * Add an observer to target this Subject.
     * @param observer an observer.
     */
    public addObserver(observer : Observer) : void{
        this.observers.add(observer)
    }
 
    /**
     * Remove an observer from this subject.
     * @param observer an observer.
     */
    public removeObserver(observer : Observer) : void{
        this.observers.delete(observer);
    }

    /**
     * Notify all the observer that are targeting this Subject
     */
    public notify() : void{
        this.observers.forEach(observer => {
            observer.update();
        })
    }
}