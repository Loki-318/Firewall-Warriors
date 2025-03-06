from fastapi import FastAPI, File, UploadFile

app = FastAPI()

def clean_transcription_data(data):
    cleaned_data = []
    
    for item in data:
        cleaned_item = {
            key: value for key, value in item.items() 
            if key not in ['avg_logprob', 'no_speech_prob']
        }
        cleaned_data.append(cleaned_item)
    
    return cleaned_data

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        buffer.write(await file.read())
    
    start = time.time()
    
    files = [temp_file]
    lang_codes = ["en"]
    tasks = ["transcribe"]
    initial_prompts = [None]
    
    out = model.transcribe_with_vad(files, lang_codes=lang_codes, tasks=tasks, initial_prompts=initial_prompts, batch_size=batch_size)
    
    os.remove(temp_file)    
    
    whisper_s2t.write_outputs(out, format='vtt', op_files=["output.txt"])
    whisper_s2t.write_outputs(out, format='json', op_files=["output.json"])

    with open("output.json", "r") as f:
        data = json.load(f)
    
    cleaned_data = clean_transcription_data(data)
    json.dump(cleaned_data, open("output.json", "w"), indent=4)

    res = open('output.txt', 'r').read()[6:]
    
    end = time.time()
    print(f"\nTime taken for transcription: {end - start}")
    
    gc.collect()
    torch.cuda.empty_cache()

    return {"transcription": res}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)


# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# import torch
# import time
# import gc
# import uvicorn
# import os
# from faster_whisper import WhisperModel

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# device = "cuda" if torch.cuda.is_available() else "cpu"
# compute_type = "float16" if device == "cuda" else "int8"
# model_size = "small"

# model = WhisperModel(model_size, device=device, compute_type=compute_type)

# @app.post("/transcribe/")
# async def transcribe_audio(file: UploadFile = File(...)):
#     temp_file = f"temp_{file.filename}"
#     with open(temp_file, "wb") as buffer:
#         buffer.write(await file.read())
    
#     start = time.time()

#     segments, info = model.transcribe(temp_file, language="en")

#     transcription = " ".join(segment.text for segment in segments)

#     os.remove(temp_file)

#     end = time.time()
#     print(f"\nTime taken for transcription: {end - start}")

#     gc.collect()
#     if device == "cuda":
#         torch.cuda.empty_cache()

#     return {"transcription": transcription}

# if __name__ == "__main__":
#     uvicorn.run(app, host="localhost", port=8000)
