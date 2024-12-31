from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from nltk.tokenize import sent_tokenize
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model_name = "JakobKaiser/bert-base-uncased-md_gender_bias-trained"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided."}), 400

    sentences = sent_tokenize(text)
    total_sentences = len(sentences)
    biased_count = 0

    overall_bias_score = 0
    overall_neutral_score = 0

    for sentence in sentences:
        inputs = tokenizer(sentence, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            scores = torch.softmax(outputs.logits, dim=1)

        bias_score = scores[0][1].item() * 100
        neutral_score = scores[0][0].item() * 100  

        overall_bias_score += bias_score
        overall_neutral_score += neutral_score

        if bias_score > neutral_score:
            biased_count += 1

    bias_percentage = (biased_count / total_sentences) * 100 if total_sentences > 0 else 0

    average_bias_score = overall_bias_score / total_sentences if total_sentences > 0 else 0
    average_neutral_score = overall_neutral_score / total_sentences if total_sentences > 0 else 0

    return jsonify({
        "bias_percentage": round(bias_percentage, 2),
        "average_bias_score": round(average_bias_score, 2),
        "average_neutral_score": round(average_neutral_score, 2),
        "sentences": sentences
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
