# 1. Cài đặt môi trường
    - Cài python 3.7
    - Tải tesseract 'https://github.com/UB-Mannheim/tesseract/wiki'
    - Cài đặt
    + Sửa pytesseract.pytesseract.tesseract_cmd trong app/views.py thành đường dẫn cài đặt
    - Tải pip từ 'https://bootstrap.pypa.io/get-pip.py'
    
    + Sau đó chạy:
    python get-pip.py
    - Tải project về 
    - cd vào ocr
    + Sau đó chạy:
    pip install -r requirements.txt
    python manage.py makemigrations
    python manage.py migrate
# 2. Start server    
    + Chạy:
    python manage.py runserver 