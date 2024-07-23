import { Device } from 'homey'
import { createRPCError } from 'ocpp-rpc'
import RPCServerClient, { IHandlersOption } from 'ocpp-rpc/lib/client'

type BootNotificationPayload = {
    status: string
    interval: number
    currentTime: string
}

type HeartBeatPayload = {
    currentTime: string
}

type StatusNotificationPayload = {}

export interface IOCPPCharger {
    onConnected(client: RPCServerClient): Promise<void>
    onBootNotification(options: IHandlersOption): Promise<BootNotificationPayload>
    onHeartbeat(options: IHandlersOption): Promise<HeartBeatPayload>
    onStatusNotification(options: IHandlersOption): Promise<StatusNotificationPayload>
}

const HEARTBEAT_TIMEOUT = 60 * 1000

class OCCPCharger extends Device implements IOCPPCharger {

    _client: RPCServerClient | undefined
    _heartbeatTimeout: NodeJS.Timeout | undefined

    async onInit(): Promise<void> {
        this.setUnavailable('Waiting for charging station to connect')
    }

    async onConnected(client: RPCServerClient): Promise<void> {
        this._client = client
        this._client.handle('BootNotification', this.onBootNotification.bind(this))
        this._client.handle('Heartbeat', this.onHeartbeat.bind(this))
        this._client.handle('StatusNotification', this.onStatusNotification.bind(this))
        this._client.on('disconnect', this.onDisconnected.bind(this))
        client.handle(() => { throw createRPCError('NotImplemented') })
    }

    async onDisconnected(): Promise<IHandlersOption> {
        this._client = undefined
        if (this._heartbeatTimeout) clearTimeout(this._heartbeatTimeout)
        this.setUnavailable('Charging station disconnected')
        return {}
    }

    async onBootNotification(): Promise<BootNotificationPayload> {
        return {
            status: 'Accepted',
            interval: 300,
            currentTime: new Date().toISOString(),
        }
    }

    async onHeartbeat(): Promise<HeartBeatPayload> {
        if (this._heartbeatTimeout) clearTimeout(this._heartbeatTimeout)
        this._heartbeatTimeout = setTimeout(() => { this.setUnavailable('Charging station not responding') }, HEARTBEAT_TIMEOUT)
        this.setAvailable()
        return {
            currentTime: new Date().toISOString(),
        }
    }

    async onStatusNotification(): Promise<StatusNotificationPayload> {
        return {}
    }
}

module.exports = OCCPCharger
