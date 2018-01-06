import * as WebSocket from "ws";

/**
 * Actively handles the heartbeat ping/pong mechanism respecting the specified parameters
 */
export class HeartbeatHandler {

    private static readonly STATE_OPEN = 1;
    private static readonly CLOSURE_MESSAGE = "Heartbeat stopped";

    private static websocket: WebSocket;
    private static pingInterval: number;
    private static onDeath: () => any;
    private static alive: boolean;

    /**
     * Does some basic checks about the web socket state and starts
     * the actual heartbeat monitoring.
     *
     * @param websocket    The web socket instance on which we want to
     *                     perform the checks and start the monitoring.
     * @param pingInterval The interval between which ping/pong messages
     *                     are exchanged between client and server.
     * @param onDeath      Callback called on client/server connection end,
     *                     detected from missing heartbeat updates.
     */
    public static handle(
        websocket: WebSocket,
        pingInterval: number,
        onDeath?: () => any ): void {

        this.websocket = websocket;
        this.pingInterval = pingInterval;
        this.onDeath = onDeath;
        this.alive = true;

        websocket.on( "pong", () => {
            this.alive = true;
        } );

        if( websocket.readyState !== this.STATE_OPEN ) {

            websocket.on( "open", () => {
                this.handleHeartbeat();
            } );
            return;

        }
        this.handleHeartbeat();

    }

    /**
     * Implements the business logic required for the heartbeat detection to work.
     */
    private static handleHeartbeat(): void {

        setInterval( () => {

            if( !this.alive ) {
                this.websocket.close( -1, this.CLOSURE_MESSAGE );
                return;
            }

            this.alive = false;
            this.websocket.ping();

        }, this.pingInterval );

    }

}