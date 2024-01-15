from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf


#Model variable
MODEL = tf.keras.models.load_model("../models/1")
CLASS_NAMES = [
    "Abyssinian",
    "American Bobtail",
    "American Curl",
    "American Shorthair",
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Egyptian Mau",
    "Exotic Shorthair",
    "Maine Coon",
    "Manx",
    "Norwegian Forest",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Scottish Fold",
    "Siamese",
    "Sphynx",
    "Turkish Angora"
]

app = FastAPI()

@app.get("/ping")
async def ping(): 
    return "Hello, I'm a Fast API Server"

#convert 
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
): 
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    prediction = MODEL.predict(img_batch)
    pass

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
