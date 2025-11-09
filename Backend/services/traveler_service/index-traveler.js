import {Kafka , Partitioners} from 'kafkajs'
import {getProfile , updateUser} from './traveler-controllers.js'
const kafka = new Kafka({
    clientId : "Traveler-Service" , 
    brokers : ["localhost:9092"]
})

const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner})
const consumer = kafka.consumer()

await producer.connect()
await consumer.connect()
await consumer.subscribe({groupId : "traveler-service" , fromBeginning : false})
consumer.run({
    eachMessage : async({topic , partition , message})=>{
        const request = JSON.parse(message.value)
        if (request.operation === "Get-Profile"){
            const response = getProfile(request.id)
            producer.send({topic : 'traveler-response', 
                messages : [{value : JSON.stringify(response)}]
            })
        }
        if (request.operation === "Put-Profile"){
            const response = updateProfile(request.id , request.details)
            producer.send({topic : 'traveler-response' , 
                messages : [{value : JSON.stringify(response)}]
            })
        }
    }
})