
from django.http import JsonResponse
from .train_model import train_model  # Import the train_model function
import os

def train_model_view(request):
    if request.method == "POST":
        ticker = request.POST.get("ticker", "GOOGL")  # Get ticker from POST body
        print(f"{ticker} that is the ticker")
    elif request.method == "GET":
        ticker = request.GET.get("ticker", "GOOGL")  # Get ticker from query params
        print(f"{ticker} that is the ticker")
    else:
        return JsonResponse({"status": "error", "message": "Only GET and POST requests are allowed"}, status=405)

    try:
        print(f"{ticker} that is the ticker")
        if not ticker:
            return JsonResponse({"status": "error", "message": "Ticker is required"}, status=400)

        # Call train_model with the ticker
        train_model(ticker=ticker)

        return JsonResponse({"status": "success", "message": "Model trained successfully"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
def get_training_progress(request):
    try:
        progress_file = os.path.join(settings.BASE_DIR, 'random_forest', 'training_progress.json')
        with open(progress_file, 'r') as f:
            progress = json.load(f)
        return JsonResponse(progress)
    except FileNotFoundError:
        return JsonResponse({"stage": "Not started", "percentage": 0})