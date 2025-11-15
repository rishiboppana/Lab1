const express = require('express')
const { getProperties, getProperty, postProperty, putProperty, deleteProperty } = require("./controller.js")

const r = express.Router()

r.get('/properties', async (req, res) => {
    try {
        const properties = await getProperties()
        res.status(200).json(properties)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

r.get('/properties/:id', async (req, res) => {
    try {
        const property = await getProperty(req.params.id)
        res.status(200).json(property)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
})

r.post('/properties', async (req, res) => {
    try {
        const response = await postProperty(req.body)
        res.status(201).json(response)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

r.put('/properties/:id', async (req, res) => {
    try {
        const response = await putProperty(req.params.id, req.body)
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

r.delete('/properties/:id', async (req, res) => {
    try {
        const response = await deleteProperty(req.params.id)
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = r