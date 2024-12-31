from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from flask import Flask, request, jsonify

app = Flask(__name__)

model_name = "JakobKaiser/bert-base-uncased-md_gender_bias-trained"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided."}), 400

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        scores = torch.softmax(outputs.logits, dim=1)

    bias_score = scores[0][1].item() * 100  
    neutral_score = scores[0][0].item() * 100 

    return jsonify({
        "bias_score": round(bias_score, 2),
        "neutral_score": round(neutral_score, 2),
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
