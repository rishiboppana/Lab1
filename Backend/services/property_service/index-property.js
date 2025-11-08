import {Kafka , Partitioners } from 'kafkajs'
import {getAllProperties , getSearchProperties , getPropertyById , postProperty , putProperty , deleteProperty} from './controllers.js'
const kafka = new Kafka({
    clientId : "property-service",
    brokers : ["localhost:9092"]
})

const producer = kafka.producer()
const consumer = kafka.consumer({groupId : "property-service"})

await producer.connect({createPartitioner: Partitioners.LegacyPartitioner})
await consumer.connect()

try {
    consumer.subscribe({topic : 'property-service' , fromBeginning : true})
     
    await consumer.run({
        eachMessage : async ({topic , partition , message}) =>{
            const request = JSON.parse(message.value.toString())
            let response 
            switch(request.operation){
                case "Get-All" :
                    response = await getAllProperties()
                    break
                case "Search" : 
                    response = await getSearchProperties(request.search)
                    break 
                case "Get-Id" : 
                    response = await getPropertyById(request.id)
                    break
                case "Post" : 
                    response = await postProperty(request.details)
                    break
                case "Put" : 
                    response = await putProperty(request.old , request.details)
                    break
                case "Delete" : 
                    response = await deleteProperty(request.user , request.id)
                    break
                default:
                    response = {error: "Unknown operation"}
            }
            await producer.send({
                topic : 'property-response' , 
                messages : [{value : JSON.stringify({data : response})}]
            })
        }
    })
}catch(err){
    console.log("Error Occured at Property Service : ",err)
}