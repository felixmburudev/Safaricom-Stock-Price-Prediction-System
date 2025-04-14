# stocks/views.py
from django.http import JsonResponse
import yfinance as yf
from datetime import datetime, timedelta
from django.core.management import call_command
from .models import StockData

def get_stock_data(request):
    try:
        start_date = "2024-03-20"
        end_date = "2025-03-20"

        stock = yf.Ticker("GOOGL")
        data = stock.history(start=start_date, end=end_date)

        # Check if data is empty
        if data.empty:
            return JsonResponse(
                {'error': 'No stock data found. Check the ticker symbol and date range.'},
                status=404
            )

        # Process valid data
        stock_data = {
            'dates': data.index.strftime('%Y-%m-%d').tolist(),
            'prices': data['Close'].tolist() if 'Close' in data else [],
            'opens': data['Open'].tolist() if 'Open' in data else [],
            'highs': data['High'].tolist() if 'High' in data else [],
            'lows': data['Low'].tolist() if 'Low' in data else [],
            'volumes': data['Volume'].tolist() if 'Volume' in data else [],
            'price_high': max(data['Close']) if 'Close' in data and not data['Close'].empty else None,
            'price_low': min(data['Close']) if 'Close' in data and not data['Close'].empty else None,
            'avg_volume': (
                sum(data['Volume']) / len(data['Volume'])
                if 'Volume' in data and len(data['Volume']) > 0
                else 0
            ),
        }

        # Optionally save data
        # save_stock_data(stock_data)

        return JsonResponse(stock_data)

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