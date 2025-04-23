
from django.http import JsonResponse
from .train_model import train_model, train_batch_model  
import os
def train_model_view(request):
    if request.method == "GET":
        ticker = request.GET.get("ticker", "GOOGL")
        n_estimators = int(request.GET.get("n_estimators", 100))
        max_depth = int(request.GET.get("max_depth", 10))
        random_state = int(request.GET.get("random_state", 42))
        start_date = request.GET.get("start_date", "2000-01-01")
        end_date = request.GET.get("end_date", "2025-03-31")
        
        print(f"Received parameters: ticker={ticker}, n_estimators={n_estimators}, max_depth={max_depth}, "
              f"random_state={random_state}, start_date={start_date}, end_date={end_date}")

        try:
            if not ticker:
                return JsonResponse({"status": "error", "message": "Ticker is required"}, status=400)

            success = train_model(ticker, n_estimators, max_depth, random_state, start_date, end_date)

            if success:
                return JsonResponse({"status": "success", "message": "Model trained successfully"})
            else:
                return JsonResponse({"status": "error", "message": "Training failed"}, status=500)
        except Exception as e:
            print(f"Error: {str(e)}")  
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    else:
        return JsonResponse({"status": "error", "message": "Only GET requests are allowed"}, status=405)

def train_batch_model_view(request):
    if request.method == "GET":
        try:
            start_date = request.GET.get("start_date", "2000-01-01")  
            end_date = request.GET.get("end_date", "2025-03-31")     
            n_estimators = int(request.GET.get("n_estimators", 100))   
            max_depth = int(request.GET.get("max_depth", 10))          
            random_state = int(request.GET.get("random_state", 42))    

            print(f"Received parameters:")
            print(f"Start Date: {start_date}")
            print(f"End Date: {end_date}")
            print(f"n_estimators: {n_estimators}")
            print(f"max_depth: {max_depth}")
            print(f"random_state: {random_state}")

            if not (10 <= n_estimators <= 500 and 1 <= max_depth <= 50 and 0 <= random_state <= 9999):
                return JsonResponse({"status": "error", "message": "Invalid parameter values"}, status=400)


            tickers = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMZN'] 
            train_batch_model(tickers, start_date, end_date, n_estimators, max_depth, random_state)

            # Return a success response
            return JsonResponse({"status": "success", "message": "Model training started successfully"})
        
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Only GET requests are allowed"}, status=405)
    

def get_training_progress(request):
    try:
        progress_file = os.path.join(settings.BASE_DIR, 'random_forest', 'training_progress.json')
        with open(progress_file, 'r') as f:
            progress = json.load(f)
        return JsonResponse(progress)
    except FileNotFoundError:
        return JsonResponse({"stage": "Not started", "percentage": 0})