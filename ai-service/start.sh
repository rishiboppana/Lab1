#!/bin/bash
# ai-service/start.sh

# Start Ollama service in background
ollama serve &

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to start..."
sleep 10

# Pull the model (change to your model)
echo "📥 Pulling Ollama model..."
ollama pull llama2

# Start FastAPI with uvicorn
echo "🚀 Starting FastAPI service..."
uvicorn main:app --host 0.0.0.0 --port 8000