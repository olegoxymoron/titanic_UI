from django.urls import path, include
from . import views

urlpatterns = [
	path('features/', views.FeaturesAPI.as_view(), name='features-api'),

	path('', views.homepage, name='home')
]