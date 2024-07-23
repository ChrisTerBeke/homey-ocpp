import { RPCServer, createRPCError } from 'ocpp-rpc'

const server = new RPCServer({
    protocols: ['ocpp1.6', 'ocpp2.0.1'],
    strictMode: true,
})

server.auth((accept, reject, handshake) => {
    console.log('handshake', handshake)
    accept()
})

server.on('client', async (client) => {
    console.log('client', client)

    client.handle('BootNotification', ({ params }) => {
        console.log('BootNotification', params)

        return {
            status: 'Accepted',
            interval: 300,
            currentTime: new Date().toISOString(),
        }
    })

    client.handle('Heartbeat', ({ params }) => {
        console.log('heartbeat', params)

        return {
            currentTime: new Date().toISOString(),
        }
    });

    client.handle('StatusNotification', ({ params }) => {
        console.log('StatusNotification', params)
        return {}
    })

    client.handle(({ method, params }) => {
        console.log('RPC', method, params)

        throw createRPCError('NotImplemented')
    })
})

await server.listen(3000)
