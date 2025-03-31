from django.http import JsonResponse
from .train_model import train_model
import os  # Add this import
import json
from django.conf import settings

def train_model_view(request):
    try:
        train_model()
        return JsonResponse({"status": "success", "message": "Model trained successfully"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})

def get_training_progress(request):
    try:
        progress_file = os.path.join(settings.BASE_DIR, 'random_forest', 'training_progress.json')
        with open(progress_file, 'r') as f:
            progress = json.load(f)
        return JsonResponse(progress)
    except FileNotFoundError:
        return JsonResponse({"stage": "Not started", "percentage": 0})