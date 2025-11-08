import mongoose from 'mongoose'
import { Kafka } from 'kafkajs'

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/properties")
console.log("✅ Connected to MongoDB")

// Define the same schema
const propertySchema = new mongoose.Schema({
    id: Number,
    owner_id: Number,
    title: String,
    type: String,
    location: String,
    description: String,
    price_per_night: String,
    bedrooms: Number,
    bathrooms: Number,
    amenities: [{ type: String, lowercase: true }],
    number_of_guests: Number,
    image: [{ type: String }]
})

propertySchema.set('timestamps', true)
const Property = mongoose.model('property', propertySchema)

// Sample data
const sampleProperties = [
    {
        id: 1,
        owner_id: 101,
        title: "Cozy Downtown Apartment",
        type: "Apartment",
        location: "New York",
        description: "Beautiful apartment in the heart of downtown",
        price_per_night: "150",
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "parking"],
        number_of_guests: 4,
        image: ["https://example.com/image1.jpg"]
    },
    {
        id: 2,
        owner_id: 102,
        title: "Beachfront Villa",
        type: "Villa",
        location: "Miami",
        description: "Stunning villa with ocean views",
        price_per_night: "350",
        bedrooms: 4,
        bathrooms: 3,
        amenities: ["wifi", "pool", "beach access", "parking"],
        number_of_guests: 8,
        image: ["https://example.com/image2.jpg"]
    },
    {
        id: 3,
        owner_id: 103,
        title: "Mountain Cabin Retreat",
        type: "Cabin",
        location: "Colorado",
        description: "Peaceful cabin in the mountains",
        price_per_night: "200",
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["wifi", "fireplace", "hot tub"],
        number_of_guests: 6,
        image: ["https://example.com/image3.jpg"]
    }
]

// Seed the database
async function seedDatabase() {
    try {
        // Clear existing data
        await Property.deleteMany({})
        console.log("🗑️  Cleared existing properties")
        
        // Insert sample data
        await Property.insertMany(sampleProperties)
        console.log("✅ Seeded database with sample properties")
        console.log(`   Added ${sampleProperties.length} properties\n`)
    } catch (err) {
        console.error("❌ Error seeding database:", err)
    }
}

// Kafka setup for testing
const kafka = new Kafka({
    clientId: "test-client",
    brokers: ["localhost:9092"]
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: "test-consumer-" + Date.now() })

// Test functions
async function sendTestMessage(operation, additionalData = {}) {
    const message = { operation, ...additionalData }
    console.log(`📤 Sending: ${operation}`, additionalData)
    
    await producer.send({
        topic: 'property-service',
        messages: [{ value: JSON.stringify(message) }]
    })
}

async function runTests() {
    try {
        // Seed database first
        await seedDatabase()
        
        // Connect Kafka
        await producer.connect()
        await consumer.connect()
        console.log("✅ Connected to Kafka\n")
        
        // Subscribe to responses
        await consumer.subscribe({ topic: 'property-response', fromBeginning: false })
        
        let testCount = 0
        
        consumer.run({
            eachMessage: async ({ message }) => {
                const response = JSON.parse(message.value.toString())
                console.log('📥 Response received:')
                console.log(JSON.stringify(response, null, 2))
                console.log('---\n')
                
                testCount++
                
                // Run next test after receiving response
                if (testCount === 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    await sendTestMessage("Search", { search: "Miami" })
                } else if (testCount === 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    await sendTestMessage("Get-Id", { id: 2 })
                } else if (testCount === 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    await sendTestMessage("Post", {
                        details: {
                            id: 4,
                            owner_id: 104,
                            title: "City Loft",
                            type: "Loft",
                            location: "San Francisco",
                            description: "Modern loft in tech district",
                            price_per_night: "250",
                            bedrooms: 2,
                            bathrooms: 2,
                            amenities: ["wifi", "gym", "rooftop"],
                            number_of_guests: 4,
                            image: ["https://example.com/image4.jpg"]
                        }
                    })
                } else if (testCount === 4) {
                    console.log("✅ All tests completed!")
                    console.log("🔍 Check your MongoDB to verify the data")
                    await cleanup()
                }
            }
        })
        
        // Start first test
        console.log("🧪 Starting tests...\n")
        await new Promise(resolve => setTimeout(resolve, 1000))
        await sendTestMessage("Get-All")
        
    } catch (err) {
        console.error("❌ Test error:", err)
        await cleanup()
    }
}

async function cleanup() {
    await producer.disconnect()
    await consumer.disconnect()
    await mongoose.connection.close()
    console.log("\n👋 Disconnected from services")
    process.exit(0)
}

// Run the tests
runTests()