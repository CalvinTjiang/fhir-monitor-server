import Observer from '../observers/Observer'
import * as socketio from 'socket.io';
/**
 * A controller observer class which implements observer
 */
export default class ControllerObserver implements Observer {
    private code: string;
    private socket: any;

    constructor(code: string, socket:any) {
        this.code = code;
        this.socket = socket;
    }

    public update(): void {
        this.socket.emit(this.code);
    }
    
}