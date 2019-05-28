from django import forms


class Form(forms.Form):
    file = forms.FileField(label='Chọn file')