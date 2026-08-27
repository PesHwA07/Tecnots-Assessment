FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install CPU-only PyTorch first (avoids downloading ~2GB of NVIDIA CUDA libs)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
