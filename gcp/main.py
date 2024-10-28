from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import storage
import tensorflow as tf
from PIL import Image
import numpy as np
import json
import functions_framework

app = Flask(__name__)
cors_config = json.load(open("cors-file.json"))
cors_patterns = {cfg["origin"][0]: {"origins": cfg["origin"], "methods": cfg["method"]} for cfg in cors_config}
CORS(app, resources=cors_patterns)

model = None
BUCKET_NAME = "turchyn-tf-models"
class_names = [
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

def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)

    blob.download_to_filename(destination_file_name)

    print(f"Blob {source_blob_name} downloaded to {destination_file_name}.")

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict(request):
    global model
    if model is None:
        download_blob(
            BUCKET_NAME,
            "models/cats.h5",
            "/tmp/cats.h5",
        )
        model = tf.keras.models.load_model("/tmp/cats.h5")

    image = request.files["file"]

    image = np.array(
        Image.open(image).convert("RGB").resize((256, 256))  # image resizing
    )

    image = image.astype('uint8')
    image = image / 255  # normalize the image in the 0 to 1 range

    img_array = tf.expand_dims(image, 0)
    predictions = model.predict(img_array)

    print("Predictions:", predictions[0])
    print("Prediction Length:", len(predictions[0]))

    predicted_class = class_names[np.argmax(predictions[0])]
    print("Predicted Class Index: ", np.argmax(predictions[0]))
    print("Predicted Class Index: ", np.argmax(predictions[0]))
    confidence = round(100 * (np.max(predictions[0])), 2)

    response = {"class": predicted_class, "confidence": confidence}

    #CORS POLICY
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "http://kittyclassifier.web.app",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)
    
    headers = {"Access-Control-Allow-Origin": "*"}

    return jsonify(response), 200, headers

if __name__ == '__main__':
    app.run(debug=True)
