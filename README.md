# Frontend :
cd Frontend/my-react-app
npm install
npm run dev

got to http://localhost:5173/

# Backend : 
Change the environment variables for connecting to your database
nodemon src/index.js

# Agent : 
download ollama 
pull the model llama3.2:latest 
run ollama serve command to run your llama model on the backend 

cd ai-service
Change the environment variables for connecting to your database
pip install -r requirements.txt
python3 main.py
