const {Kafka }= require('kafkajs')

const kafka = new Kafka({
    clientId : "kafka-service" , 
    brokers : ["localhost:9092"]
})

const admin = kafka.admin()

const deletetopics = async() =>{
    await admin.deleteTopics({
        topics : ["booking-serve"]
    })
}

const run = async ()=>{
    // await admin.connect()
    await admin.createTopics({
        topics : [
            {topic : "booking-service"},
            {topic : "payment-service"}
        ]
    })
    // await deletetopics()
    topics = await admin.listTopics()
    console.log(topics)
}

run()