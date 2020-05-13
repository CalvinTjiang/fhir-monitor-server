/**
 * An Abstract class Observer which are the base class of all Observer
 */
interface Observer {

    /**
     * Update method that will be called by the subject to tell the Observer to update its data
     */
    update() : void;
}