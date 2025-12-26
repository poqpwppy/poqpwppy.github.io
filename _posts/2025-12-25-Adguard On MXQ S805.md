---
title: Adguard Home On MXQ S805
date: 2025-12-25 15:00:00 +0700
categories: [Random, Linux, Android, TVBOX]
tags: [random, linux, android]
author: khoa
description: Adguard Home installation on MXQ S805 through LibreELEC
toc: true
comments: true
---

## **Cách mình làm**

### Tìm hiểu
Box mình đang dùng là MXQ (từ thời tống), dùng chip Amlogic S805.

Ban đầu thì mình cố tải thử Armbian trên nó, nhưng có vẻ là không khả thi vì nó cứ vào recovery mode và KHÓ VL :(

Sau khoảng 1 tuần mày mò tìm hiểu thì mình lại tìm ra được quả LibreElec khá là oke, và đã cài thành công, cài được Adguard Home luôn.
### Nghịch
Dưới đây là các bước để cài LibreElec và Adguard Home trên MXQ

#### Tải các file cần thiết
Các bạn tải file tại đây [https://libreelec.dtech.hu/images/S805/](https://libreelec.dtech.hu/images/S805/)

![img-description](https://i.ibb.co/bjPqfbD2/1.png)
_Tải file_

#### Setup Usb
Sau khi tải về và giải nén ra các bạn sẽ có 2 file.

Đầu tiên dùng Balena Etcher hoặc Rufus để flash file có đuôi ```.img``` vào usb.

Sau khi flash xong thì các bạn copy file có đuôi ```.zip``` vào usb.

#### Tải LibreElec lên máy ảo

Đầu tiên các bạn cắm usb vào MXQ, có port được và có port không, mình dùng ```port 4``` ở phía sau box (khoan cắm nguồn nhé).

Lấy 1 cây tăm chọt vào cổng AV và giữ cho nó nhấn cái nút reset ở phía trong, đồng thời cắm nguồn (vẫn giữ tăm sau khi cắm nguồn).

Sau khi MXQ bật lên, nếu bạn vào được luôn LibreELEC thì ngon, không thì xui :)))

Nếu nó không vào luôn LibreELEC thì nó sẽ ra cái màn hình recovery như ở dưới:

![img-description](https://i.ibb.co/B5qj52j0/80dd6e4f9bfc1adfd369c8d6f268cf2d90819269.jpg)
_Màn hình recovery_

Các bạn chọn Apply update from EXT -> Update from udisk rồi chọn file có đuôi ```.zip```, đợi nó tải xong là húp :)))

#### Cài Docker và Adguard Home
##### Docker
Sau khi đã xong các bước setup đầu của LibreELEC thì đến bước cài ```Docker``` và ```Adguard```

Ở màn hình chính của Kodi có phần ```Addons```, vào phần tải và tìm Docker, các bạn sẽ có kết quả như ở dưới:

![img-description](https://i.ibb.co/XfTBCRry/image-2025-12-26-214645562.png)
_Cài Docker_

Đợi nó tải xong là các bạn có Docker.

##### Adguard Home
Giờ đến bước cài Adguard Home.

Các bạn có thể xem thêm cách tải [ở đây](https://hub.docker.com/r/adguard/adguardhome)

Đầu tiên ssh vào MXQ hoặc có addons gì ssh qua web browser (mình quên bố nó tên rồi) các bạn có thể dùng, sau đó pull image về:
```bash
docker pull adguard/adguardhome
```

Sau đó dùng lệnh sau để tạo và chạy Adguard Home:
```bash
docker run --name adguardhome\
    --restart unless-stopped\
    -v /storage/my/own/workdir:/opt/adguardhome/work\
    -v /storage/my/own/confdir:/opt/adguardhome/conf\
    -p 53:53/tcp -p 53:53/udp\
    -p 67:67/udp -p 68:68/udp\
    -p 80:80/tcp -p 443:443/tcp -p 443:443/udp -p 3000:3000/tcp\
    -p 853:853/tcp\
    -p 784:784/udp -p 853:853/udp -p 8853:8853/udp\
    -p 5443:5443/tcp -p 5443:5443/udp\
    -d adguard/adguardhome

```

Vậy là các bạn đã có Adguard Home chỉ với trên con tv box ve chai :)) quá húp.

Các lệnh điều khiển Adguard Home:

Start: 
```bash
docker start adguardhome
```

Stop: 
```bash
docker stop adguardhome
```

Remove: 
```bash
docker rm adguardhome
```

Sau khi bật lên thì các bạn truy cập vào ```ip-tv-box:3000``` để config Adguard Home.

Về cách config Adguard Home thì các bạn xem [tại đây](https://adguard-dns.io/kb/adguard-home/running-securely/)
## **Kết luận**
### Tâm sự
Con MXQ S805 này là con tv box cũ rồi, cấu hình không mạnh lắm nhưng mà cũng đủ để các bạn có thêm 1 home server mà không phải đem bán ve chai :)))

Thực sự cài đồ chơi trên con này cũng khó vl nhưng vì mình thấy tiếc quá nên cũng gắng cài, tiện viết hướng dẫn cho những bạn muốn cài luôn, vì mình tìm mãi trên mạng mà không thấy cách cài đâu :")

Ngoài Adguard Home ra thì các bạn có thể cài thêm những cái khác để nghịch ngợm, cài ít thôi nhé vì nó không nhiều dung lượng đâu :v
## **Lời kết**
Chúc các bạn tận hưởng con mini home server nhé, nhìn lỏ lỏ thôi mà xài cũng oke :))