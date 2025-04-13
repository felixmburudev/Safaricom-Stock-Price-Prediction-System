# stocks/views.py
from django.http import JsonResponse
import yfinance as yf
from datetime import datetime, timedelta
from django.core.management import call_command
from .models import StockData

def get_stock_data(request):
    try:
        ticker = request.GET.get('ticker', '')
        print(f"Received ticker after: {ticker}")
        data = yf.download(ticker, period="30d")[['Close']].dropna()
        # Format as list of { date, price }
        stock_data = [
            {"date": index.strftime('%Y-%m-%d'), "price": float(price)}
            for index, price in data['Close'].items()
        ]
        return JsonResponse({'stock_data': stock_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
def save_stock_data(stock_data):
    for entry in stock_data:
        stock_entry, created = StockData.objects.update_or_create(
            ticker=entry["ticker"],
            date=parse_date(entry["date"]),
            defaults={
                "open_price": entry["open_price"],
                "high_price": entry["high_price"],
                "low_price": entry["low_price"],
                "close_price": entry["close_price"],
                "volume": entry["volume"],
                "tomorrow": None,  # Empty column for tomorrow
                "target": None,  # Empty column for target
            }
        )
    # Run migrations to ensure database is up to date
    call_command('makemigrations')
    call_command('migrate')
    return {"message": "Stock data updated in db.sqlite3 and migrations applied"}

def get_saved_stock_data(request):
    stock_data = StockData.objects.all().values()
    return JsonResponse(list(stock_data), safe=False)