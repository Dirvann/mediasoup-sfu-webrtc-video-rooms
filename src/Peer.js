module.exports = class Peer {
    constructor(socket_id, name) {
        this.id = socket_id
        this.name = name
        this.transports = new Map()
        this.consumers = new Map()
        this.producers = new Map()
    }


    addTransport(transport) {
        this.transports.set(transport.id, transport)
    }

    async connectTransport(transport_id, dtlsParameters) {
        if (!this.transports.has(transport_id)) return
        await this.transports.get(transport_id).connect({
            dtlsParameters: dtlsParameters
        });
    }

    async createProducer(producerTransportId, rtpParameters, kind) {
        //TODO handle null errors
        let producer = await this.transports.get(producerTransportId).produce({
            kind,
            rtpParameters
        })

        this.producers.set(producer.id, producer)

        producer.on('transportclose', () => {
            console.log('transport closed producer')
            producer.close()
            this.producers.delete(producer.id)
            
        })

        return producer
    }

    async createConsumer(consumer_transport_id, producer_id, rtpCapabilities) {
        let consumerTransport = this.transports.get(consumer_transport_id)

        let consumer = null
        try {
            consumer = await consumerTransport.consume({
                producerId: producer_id,
                rtpCapabilities,
                paused: false //producer.kind === 'video',
            });
        } catch (error) {
            console.error('consume failed', error);
            return;
        }

        if (consumer.type === 'simulcast') {
            await consumer.setPreferredLayers({
                spatialLayer: 2,
                temporalLayer: 2
            });
        }

        this.consumers.set(consumer.id, consumer)

        consumer.on('transportclose', () => {
            console.log('transport close from consumer')
            this.consumers.delete(consumer.id)
        })

        

        return {
            consumer,
            params: {
                producerId: producer_id,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                producerPaused: consumer.producerPaused
            }
        }
    }

    closeProducer(producer_id) {
        try {
            this.producers.get(producer_id).close()
        } catch(e) {
            console.warn(e)
        }
    
        
        this.producers.delete(producer_id)
    }

    getProducer(producer_id) {
        return this.producers.get(producer_id)
    }

    close() {
        this.transports.forEach(transport => transport.close())
    }

    removeConsumer(consumer_id) {
        this.consumers.delete(consumer_id)
    }

}