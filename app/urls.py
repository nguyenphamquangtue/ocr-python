from django.urls import path
from . import views

app_name = 'app'

urlpatterns = [
	path('',views.IndexView),
	path('convert-and-download/',views.ConvertAndDownload,name='convert_and_download'),
	path('upload/',views.Upload,name='upload'),
	path('delete/',views.Delete,name='delete'),
]