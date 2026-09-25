# Import variabel 'app' FastAPI asli dari file main.py kamu
from main import app 
import gradio as gr
import spaces

# --- TRICK ZEROGPU HUGGING FACE ---
@spaces.GPU
def dummy_gpu_function():
    return "GPU bypass berhasil!"

with gr.Blocks() as gradio_app:
    gr.Markdown("### API Backend Stock Tracker Berjalan Normal")
    btn = gr.Button("Cek Status Server")
    out = gr.Textbox(label="Output")
    btn.click(fn=dummy_gpu_function, inputs=[], outputs=out)

# Mount UI Gradio ke aplikasi FastAPI asli kamu
app = gr.mount_gradio_app(app, gradio_app, path="/")