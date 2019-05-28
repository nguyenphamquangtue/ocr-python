import json
import os
from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import HttpResponseForbidden
from .forms import Form

from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import ensure_csrf_cookie


try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract

# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract'

# Create your views here.

@ensure_csrf_cookie

def IndexView(request):
    form = Form()
    return render(request, 'index.html', {'form': form})


def ConvertAndDownload(request):
    if request.method == 'POST':
        filename = request.POST['filename']
        dir_upload = 'app/static/upload/'
        try:
            data = pytesseract.image_to_string(Image.open(dir_upload+filename))
        except:
            data = ''
        text = {}
        text['text'] = data
        return HttpResponse(json.dumps(text),content_type='application/json')
    else:
        return HttpResponseForbidden()

def Upload(request):
    if request.method == 'POST':
        file = request.FILES['file']
        dir_upload = 'app/static/upload/'
        try:
            exists = os.path.isfile(dir_upload+file.name)
            if exists:
                data = {}
                data['exist'] = 1
                data['code'] = 1
            else:
                fs = FileSystemStorage(location=dir_upload , base_url = dir_upload)
                filename = fs.save(file.name,file)
                upload_to_folder = fs.url(filename)
                data = {}
                data['exist'] = 0
                data['code'] = 1
        except:
            data = {}
            data['code'] = 0   
        if data['code']:
            return HttpResponse(json.dumps(data),content_type='application/json',status=200)
        else:
            return HttpResponse(json.dumps(data),content_type='application/json',status=403)

def Delete(request):
    if request.method == 'POST':
        dir_upload = 'app/static/upload/'
        filename = request.POST['filename']
        exists = os.path.isfile(dir_upload+filename)
        if exists:
            try:
                fs = FileSystemStorage(location=dir_upload , base_url = dir_upload)
                delete = fs.delete(filename)
                data = {}
                data['code'] = 1
                return HttpResponse(json.dumps(data),content_type='application/json',status=200)
            except:
                data = {}
                data['code'] = 0
                return HttpResponse(json.dumps(data),content_type='application/json',status=403)
        else:
            data = {}
            data['code'] = 0
            return HttpResponse(json.dumps(data),content_type='application/json',status=403)
    else:
        return HttpResponseForbidden()


