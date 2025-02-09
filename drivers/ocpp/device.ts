import { Device } from 'homey'
import { createRPCError } from 'ocpp-rpc'
import RPCServerClient, { IHandlersOption } from 'ocpp-rpc/lib/client'

// spec: https://ocpp-spec.org/schemas

type BootNotificationRequest = {
    reason: 'ApplicationReset' | 'FirmwareUpdate' | 'LocalReset' | 'PowerUp' | 'RemoteReset' | 'ScheduledReset' | 'Triggered' | 'Unknown' | 'Watchdog'
    chargingStation: {
        model: string
        vendorName: string
        serialNumber?: string
        firmwareVersion?: string
    }
}

type BootNotificationResponse = {
    status?: 'Accepted' | 'Pending' | 'Rejected'
    interval?: number
    currentTime?: string
    statusInfo?: {
        reasonCode: string
        additionalInfo?: string
    }
}

type HeartBeatRequest = {}

type HeartBeatResponse = {
    currentTime?: string
}

type AuthorizeRequest = {
    idToken: {
        idToken: string
        type: string
        additionalInfo?: [{
            additionalIdToken: string
            type: string
        }]
    },
    certificate?: string
    iso15118CertificateHashData?: {
        hashAlgorithm: 'SHA256'
        issuerNameHash: string
        issuerKeyHash: string
        serialNumber: string
        responderURL: string
    }
}

type AuthorizeResponse = {
    idTokenInfo: {
        status: string
        cacheExpiryDateTime?: string
        chargingPriority?: number
        language1?: string
        evseId?: number[]
        groupIdToken?: {
            additionalInfo: [{
                additionalIdToken: string
                type: string
            }]
            idToken: string
            type: string
        }
        language2?: string
        personalMessage?: {
            format: string
            language: string
            content: string
        }
    },
    certificateStatus?: string
}

export interface IOCPPCharger {
    onConnected(client: RPCServerClient): Promise<void>
}

const HEARTBEAT_TIMEOUT = 60 * 1000

class OCCPCharger extends Device implements IOCPPCharger {

    _client: RPCServerClient | undefined
    _heartbeatTimeout: NodeJS.Timeout | undefined

    async onInit(): Promise<void> {
        setTimeout(() => { this.setUnavailable('Waiting for charging station to connect') }, 500)
    }

    async onConnected(client: RPCServerClient): Promise<void> {
        this._client = client

        // implemented methods
        this._client.handle('BootNotification', this._onBootNotification.bind(this))
        this._client.handle('Heartbeat', this._onHeartbeat.bind(this))
        this._client.handle('Authorize', this._onAuthorize.bind(this))

        this._client.on('disconnect', this._onDisconnected.bind(this))
        client.handle(() => { throw createRPCError('NotImplemented') })
    }

    private async _onDisconnected(): Promise<IHandlersOption> {
        this._client = undefined
        if (this._heartbeatTimeout) clearTimeout(this._heartbeatTimeout)
        this.setUnavailable('Charging station disconnected')
        return {}
    }

    private async _onBootNotification({ params: BootNotificationRequest }: IHandlersOption): Promise<BootNotificationResponse> {
        // TODO: check additional security?
        return {
            status: 'Accepted',
            interval: 300,
            currentTime: new Date().toISOString(),
        }
    }

    private async _onHeartbeat({ params: HeartBeatRequest }: IHandlersOption): Promise<HeartBeatResponse> {
        if (this._heartbeatTimeout) clearTimeout(this._heartbeatTimeout)
        this._heartbeatTimeout = setTimeout(() => { this.setUnavailable('Charging station not responding') }, HEARTBEAT_TIMEOUT)
        this.setAvailable()
        return {
            currentTime: new Date().toISOString(),
        }
    }

    private async _onAuthorize({ params: AuthorizeRequest }: IHandlersOption): Promise<AuthorizeResponse> {
        // TODO: check `params.idToken.idToken` against RFID whitelist in app settings
        return {
            idTokenInfo: {
                status: 'Accepted',
            }
        }
    }
}

module.exports = OCCPCharger
