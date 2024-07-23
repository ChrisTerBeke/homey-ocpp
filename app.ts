import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import { App } from 'homey'
import { RPCServer, createRPCError } from 'ocpp-rpc'
import { IHandshakeInterface } from 'ocpp-rpc/lib/server-client'
import RPCClient from 'ocpp-rpc/lib/client'
import { IOCPPCharger } from './drivers/ocpp/device'

const { Log } = require('homey-log')

const OCPP_DRIVER = 'ocpp'

class OCPPApp extends App {
    async onInit() {
        // @ts-ignore TS2339
        this.homeyLog = new Log({ homey: this.homey })

        const server = new RPCServer({
            protocols: ['ocpp1.6'],
            strictMode: true,
        })

        server.auth(this._onAuth.bind(this))
        server.on('client', this._onClient.bind(this))
        await server.listen(3000)

        this.log('OCPP Server is running...')
    }

    private _onAuth(accept: (session?: Record<string, any>, protocol?: string | false) => void, reject: (code: number, message: string) => void, handshake: IHandshakeInterface): void {
        const device = this.homey.drivers.getDriver(OCPP_DRIVER).getDevice({ id: handshake.identity })
        if (!device) {
            return reject(401, 'identity unknown')
        }
        return accept()
    }

    private async _onClient(client: RPCClient): Promise<void> {

        // find the device instance for this client
        const device = this.homey.drivers.getDriver(OCPP_DRIVER).getDevice({ id: client.identity }) as unknown as IOCPPCharger
        if (!device) return

        // supported handlers
        client.handle('BootNotification', device.onBootNotification)
        client.handle('Heartbeat', device.onHeartbeat)
        client.handle('StatusNotification', device.onStatusNotification)

        // catch all unknown handlers
        client.handle(() => { throw createRPCError('NotImplemented') })
    }
}

module.exports = OCPPApp
