import io from 'socket.io';

import Observer from '../observers/Observer'
/**
 * A controller observer class which implements observer
 */
export default class ControllerObserver implements Observer {
    private code: string;
    private socketio: io.Server;

    constructor(code: string, socketio: io.Server) {
        this.code = code;
        this.socketio = socketio;
    }

    /**
     * Emit a message to a monitor which will be refreshed
     */
    public update(): void {
        this.socketio.emit(this.code);
    }
    
}