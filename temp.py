import whisper

# Load the model and move it to GPU
model = whisper.load_model("turbo", device="cuda")

# Transcribe
result = model.transcribe("test.wav")
print(result["text"])
