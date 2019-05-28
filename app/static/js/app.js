var app = app || {},
    data = JSON.parse(localStorage.getItem("list_image"));
data = data || {};

(function(app, data, $) {

    app.init = function(static) {
        csrf();
        $("#upfile1").click(function() {
            $("#file1").trigger('click');
        });
        $.each(data, function(index, list) {
            generateElement(static, list.filename, list.id);
        })
    }

    // Cài đặt token cho form
    const csrf = () => {
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                function getCookie(name) {
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = jQuery.trim(cookies[i]);
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
                if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            }
        });
    }

    //Tạo html
    const generateElement = (static, filename, id) => {
        var html = ` 
             <div class="item flex space" id="element-${id}">
                    <div class="flex image-name-s">
                        <img src="${static}picture.png">
                        <span class="name">${filename}</span>
                    </div>
                    <div class="flex">
                        <span class="to">to</span>
                        <img src="${static}txt.png">
                        <span class='status ready' id="status-${id}">ready</span>
                    </div>
                    <button class='convert' id="convert-${id}" onclick="app.convert('${filename}',${id})">Convert</button>
                    <button class='delete' onclick="app.delete('${filename}',${id})">Delete</button>
                    <button class="download hidden" id="download-${id}" onclick="app.download('${filename}')">Download</button>
                </div>
            `;
        $('.resutls').prepend(html);
    }
    //Hàm upload
    app.upload = (static, url) => {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            toastr.error('API không hỗ trợ cho trình duyệt này')
            return;
        }
        toastr.info('Đang upload ảnh');
        var tempData, file = $('#file1')[0].files[0],
            id, filename;
        id = new Date().getTime();
        if (file != 'undefined') {
            var formData = new FormData(),
                fileExist;
            formData.append('file', file);
            $.ajax({
                url: '/upload/',
                type: 'POST',
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                enctype: 'multipart/form-data',
                data: formData,
                success: (d) => {
                    if (!d.exist) {
                        toastr.success('Upload ảnh thành công.')
                        tempData = {
                            id: id,
                            filename: file.name
                        };
                        data[id] = tempData;
                        localStorage.setItem('list_image', JSON.stringify(data));
                        generateElement(static, tempData.filename, tempData.id);
                    } else {
                        fileExist = Object.values(data).find(function(data, index) {
                            return data.filename == file.name
                        });
                        if (typeof(fileExist) == 'undefined') {
                            toastr.success('Upload ảnh thành công.')
                            tempData = {
                                id: id,
                                filename: file.name
                            };
                            data[id] = tempData;
                            localStorage.setItem('list_image', JSON.stringify(data));
                            generateElement(static, tempData.filename, tempData.id);
                        } else {
                            toastr.warning('Ảnh đã tồn tại.');
                        }
                    }
                },
                error: (e) => {
                    toastr.error('Không thể upload ảnh.')
                }
            })
        } else {
            toastr.error('Không tìm thấy file.')
        }

    }

    app.convert = (filename, id) => {
        $(`#status-${id}`).text('Pendding').addClass('pendding').removeClass('ready');
        $.ajax({
            url: '/convert-and-download/',
            type: 'POST',
            dataType: 'json',
            data: { filename: filename },
            success: (d) => {
                if (d.text.trim() == '') {
                    $(`#status-${id}`).text('text not found').addClass('fail').removeClass('pendding');
                } else {
                    $(`#status-${id}`).text('finish').addClass('ready').removeClass('pendding');
                    $(`#download-${id}`).removeClass('hidden');
                    $(`#convert-${id}`).addClass('hidden');
                }
            },
            error: (e) => {
                $(`#status-${id}`).text('fail').addClass('fail').removeClass('pendding');
            }
        })
    }

    //Tải file text
    app.download = (name) => {
        toastr.info('Đang chạy tiến trình download...');
        $.ajax({
            url: '/convert-and-download/',
            type: 'POST',
            dataType: 'json',
            data: { filename: name },
            success: (d) => {
                var blob = new Blob([d.text], { type: 'text/plain;charset=utf-8' });
                saveAs(blob, `${name}.txt`);
                toastr.success('Hoàn tất tải về.');
            },
            error: (e) => {
                toastr.error('Lỗi! Không thể tải về.');
            }
        })

    }

    app.delete = (name, id) => {
        toastr.info('Đang xóa file...');
        $.ajax({
            url: '/delete/',
            type: 'POST',
            dataType: 'json',
            data: { filename: name },
            success: (d) => {
                delete data[id];
                localStorage.setItem('list_image', JSON.stringify(data));
                $(`#element-${id}`).remove();
                toastr.success('Xóa file hoàn tất!');
            },
            error: (e) => {
                toastr.error('Lỗi! Không thể xóa file.');
            }
        })
    }

})(app, data, jQuery)
