import { DiscoveryResultMDNSSD, Driver } from 'homey'
import { PairSession } from 'homey/lib/Driver'

type OCPPDiscoveryResultText = {
    identity: string
}

class OCPPDriver extends Driver {

    async onPair(session: PairSession) {
        const driver = this

        session.setHandler('list_devices', async function () {
            const discoveryStrategy = driver.getDiscoveryStrategy()
            const discoveryResults = discoveryStrategy.getDiscoveryResults() as { [key: string]: DiscoveryResultMDNSSD }
            return Object.values(discoveryResults).map((result: DiscoveryResultMDNSSD) => {
                const identity = (result.txt as OCPPDiscoveryResultText).identity
                return {
                    name: identity,
                    data: {
                        id: identity,
                    },
                    store: {
                        address: result.address,
                        host: result.host,
                        port: result.port,
                    }
                }
            })
        })
    }
}

module.exports = OCPPDriver
