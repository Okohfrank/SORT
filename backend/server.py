import os
import cv2
import json
import base64
import asyncio
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
AI_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'AI_model')
FLAGGED_DIR = os.path.join(os.path.dirname(__file__), 'flagged_images')
os.makedirs(FLAGGED_DIR, exist_ok=True)
DB_PATH = os.path.join(os.path.dirname(__file__), 'training_data.db')

class CameraState:
    url = "0"  # Default to 0 (laptop webcam)
    cap = None
    needs_restart = True

cam_state = CameraState()

# Initialize SQLite
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS flagged_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            image_path TEXT,
            predicted_class TEXT,
            actual_class TEXT,
            confidence REAL,
            density REAL,
            drag_coeff REAL,
            size_cm REAL,
            mass_g REAL,
            moisture REAL,
            shape_factor REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Load Models
print("Loading AI Models...")
try:
    waste_model = tf.keras.models.load_model(os.path.join(AI_MODEL_DIR, 'waste_classifier_final.keras'))
    pressure_model = joblib.load(os.path.join(AI_MODEL_DIR, 'pressure_model.pkl'))
    pressure_scaler = joblib.load(os.path.join(AI_MODEL_DIR, 'pressure_scaler.pkl'))
    label_encoder = joblib.load(os.path.join(AI_MODEL_DIR, 'label_encoder.pkl'))
    models_loaded = True
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    models_loaded = False

# Global state to hold the last processed frame and data for flagging
last_state = {
    "frame": None,
    "prediction_data": None
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

def process_frame(frame):
    if not models_loaded:
        return {"material": "Unknown", "confidence": 0.0}
    
    img = cv2.resize(frame, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    
    pred = waste_model.predict(img, verbose=0)[0][0]
    
    if pred > 0.5:
        materials = ['HDPE/PP', 'PET/PVC']
        mat = np.random.choice(materials)
        conf = float(pred)
    else:
        mat = 'Organic'
        conf = float(1.0 - pred)
        
    return {"material": mat, "confidence": conf}

def simulate_properties(material):
    props = {
        'density': 0.95 if 'HDPE' in material else (1.38 if 'PET' in material else 0.95),
        'drag_coeff': 0.5 if 'HDPE' in material else (0.55 if 'PET' in material else 0.8),
        'compartment': 1 if 'HDPE' in material else (2 if 'PET' in material else 0)
    }
    
    size_cm = np.random.uniform(0.5, 5.0)
    mass_g = props['density'] * (size_cm**3) * np.random.uniform(0.4, 0.8)
    moisture = np.random.uniform(0.0, 0.5) if material == 'Organic' else np.random.uniform(0.0, 0.1)
    shape_factor = np.random.uniform(0.6, 1.0)
    
    return {
        "density": round(props['density'], 3),
        "drag_coeff": round(props['drag_coeff'], 3),
        "size_cm": round(float(size_cm), 3),
        "mass_g": round(float(mass_g), 3),
        "moisture": round(float(moisture), 3),
        "shape_factor": round(float(shape_factor), 3),
        "compartment": props['compartment']
    }

def predict_pneumatics(material, props):
    if not models_loaded:
        return {"pressure_kpa": 50.0, "pulse_ms": 100.0}
    
    mat_raw = 'Organic' if material == 'Organic' else ('HDPE' if 'HDPE' in material else 'PET')
    try:
        mat_encoded = label_encoder.transform([mat_raw])[0]
    except:
        mat_encoded = 0
        
    features = np.array([[
        mat_encoded, 
        props['density'], 
        props['drag_coeff'],
        props['size_cm'],
        props['mass_g'],
        props['moisture'],
        props['shape_factor']
    ]])
    
    features_scaled = pressure_scaler.transform(features)
    predictions = pressure_model.predict(features_scaled)[0]
    
    return {
        "pressure_kpa": round(float(predictions[0]), 1),
        "pulse_ms": round(float(predictions[1]), 1)
    }

def get_frame(cap):
    if cap is None:
        return False, None
    ret, frame = cap.read()
    return ret, frame

async def camera_loop():
    print("Starting camera loop...")
    
    while True:
        if cam_state.needs_restart:
            if cam_state.cap:
                cam_state.cap.release()
            
            url_to_open = int(cam_state.url) if str(cam_state.url).isdigit() else cam_state.url
            print(f"Connecting to camera: {url_to_open}")
            cam_state.cap = await asyncio.to_thread(cv2.VideoCapture, url_to_open)
            cam_state.needs_restart = False
            
        if not manager.active_connections:
            await asyncio.sleep(1)
            continue
            
        ret, frame = await asyncio.to_thread(get_frame, cam_state.cap)
        
        if not ret:
            print("Failed to grab frame. Reconnecting...")
            await asyncio.sleep(2)
            cam_state.needs_restart = True
            continue
            
        # Optimization: Downscale frame to reduce base64 size and React rendering lag
        frame_display = cv2.resize(frame, (480, 360))
        
        # Run inference in thread as well to avoid event loop blocking
        ai_result = await asyncio.to_thread(process_frame, frame)
        material = ai_result['material']
        
        props = simulate_properties(material)
        pneumatics = await asyncio.to_thread(predict_pneumatics, material, props)
        
        data = {
            "type": "PARTICLE_DATA",
            "particle": {
                "id": str(datetime.now().timestamp()),
                "time": datetime.now().strftime('%H:%M:%S'),
                "type": material,
                "confidence": ai_result['confidence'],
                "mass": props['mass_g'],
                "moisture": props['moisture'],
                "size": props['size_cm'],
                "density": props['density'],
                "pressure": pneumatics['pressure_kpa'],
                "pulse": pneumatics['pulse_ms'],
                "compartment": props['compartment']
            }
        }
        
        last_state["frame"] = frame.copy()
        last_state["prediction_data"] = data["particle"]
        
        color = (0, 255, 0) if material == 'Organic' else (255, 0, 0)
        cv2.rectangle(frame_display, (80, 80), (400, 280), color, 2)
        cv2.putText(frame_display, f"{material} {int(ai_result['confidence']*100)}%", (80, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Optimization: Encode with lower JPEG quality to make the stream lightweight
        _, buffer = cv2.imencode('.jpg', frame_display, [cv2.IMWRITE_JPEG_QUALITY, 50])
        base64_frame = base64.b64encode(buffer).decode('utf-8')
        
        data["image"] = f"data:image/jpeg;base64,{base64_frame}"
        
        await manager.send_message(json.dumps(data))
        await asyncio.sleep(0.05) # Slightly faster frame rate since payload is smaller

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(camera_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("Client attempting to connect to WebSocket...")
    await manager.connect(websocket)
    print("Client connected!")
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        print("Client disconnected.")
        manager.disconnect(websocket)

async def flag_last_prediction_task(actual_class: str):
    if last_state["frame"] is None or last_state["prediction_data"] is None:
        return
        
    p = last_state["prediction_data"]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"flagged_{timestamp}.jpg"
    filepath = os.path.join(FLAGGED_DIR, filename)
    
    cv2.imwrite(filepath, last_state["frame"])
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO flagged_items 
        (timestamp, image_path, predicted_class, actual_class, confidence, density, drag_coeff, size_cm, mass_g, moisture, shape_factor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        timestamp, filepath, p['type'], actual_class, p['confidence'], 
        p['density'], p.get('drag_coeff', 0), p['size'], p['mass'], p['moisture'], p.get('shape_factor', 0)
    ))
    conn.commit()
    conn.close()
    print(f"Flagged item saved to DB: {filename}")

@app.post("/flag")
async def flag_endpoint(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    actual_class = data.get("actual_class", "Unknown")
    background_tasks.add_task(flag_last_prediction_task, actual_class)
    return {"status": "success", "message": "Frame flagged successfully"}

from pydantic import BaseModel
class CameraConfig(BaseModel):
    url: str

@app.post("/set_camera")
async def set_camera(config: CameraConfig):
    cam_state.url = config.url
    cam_state.needs_restart = True
    return {"status": "success", "url": config.url}
