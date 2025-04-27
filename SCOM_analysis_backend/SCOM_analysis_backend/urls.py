"""
URL configuration for SCOM_analysis_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path ,include
from data_loader import views
from random_forest.views import train_model_view, get_training_progress
from predict.views import predict_stock
from random_forest.views import train_model_view, train_batch_model_view , get_training_progress


urlpatterns = [
    path('admin/', admin.site.urls),
    path('test/', views.test, name='test'),
    path('stock_data/', views.get_stock_data, name='stock_data'),
    path('saved-stock-data/', views.get_saved_stock_data, name='get_saved_stock_data'), 
    path('train/', train_model_view, name='train_model'),
    path('train_batch/', train_batch_model_view, name='train_batch_model'),
    path('progress/', get_training_progress, name='training_progress'),
    path('predict/', predict_stock, name='predict_price'),
    ]
