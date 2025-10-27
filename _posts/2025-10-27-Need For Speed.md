---
title: Need For Speed
date: 2025-10-27 16:30:00 +0700
categories: [Reverse Engineering, PicoCTF 2019, Hard]
tags: [re, pico, hard]
author: khoa
description: The name of the game is speed. Are you quick enough to solve this problem and keep it above 50 mph? need-for-speed.
toc: true
comments: true
---
## **Cách mình làm**

### Soi source code
Đầu tiên mình sẽ thử mở file trong **Binary Ninja** để xem nó có gì hot

![img-description](https://i.ibb.co/JRCmQCPp/image-2025-10-27-163818862.png)
_Sau khi mở file với Binary Ninja_

### Nghịch
Mình thấy ở đây có 2 hàm **get_key()** và **print_flag()** khá thú vị, nên bây giờ mình sẽ chạy thử bằng gef và đặt breakpoint xem có gì

![img-description](https://i.ibb.co/bxNbK8c/image-2025-10-27-164454294.png)
_Sau khi xem source_

Mình sẽ đặt thử breakpoint 2 địa chỉ là 0x555555400942 và 0x55555540094c

### Flag
Sau khi mình continue 2 breakpoint này thì nó nhả flag cho mình luôn ảo vkl =)))

![img-description](https://i.ibb.co/vC4GxRsP/image-2025-10-27-164854957.png)
_WOW_

Flag: **PICOCTF{Good job keeping bus #190ca38b speeding along!}**

## **Kết luận**
Sau khi tham khảo một vài Writeup khác thì mình có kết luận như sau:

### Bản chất
Chương trình khởi tạo một biến lớn rồi giảm dần trong một vòng lặp vô nghĩa để tốn thời gian; nếu chậm sẽ alarm() và crash — mục tiêu chỉ là bỏ qua vòng lặp để in flag.

### Cách làm nhanh:
Debug & sửa biến tại runtime: dừng ở calculate_key, gán trực tiếp rbp-0x4 = <giá trị gần đích> rồi continue.

Patch tĩnh: thay lệnh mov dword [rbp-0x4], 0xd8c2... thành giá trị gần đích để vòng lặp kết thúc ngay.

Override alarm (LD_PRELOAD): ghi đè alarm()/setitimer() để vô hiệu hóa bộ hẹn giờ.Gọi thẳng print_flag() nếu có symbol — cứ gọi là xong.Kết quả: chương trình không chậm, in flag: PICOCTF{...}

### Vì sao đặt 2 breakpoint lại lòi flag ra?
Breakpoint dừng tiến trình, nên SIGALRM bị trì hoãn — chương trình không bị nổ.

Debugger chèn INT3 và thay đổi timing/control-flow, khiến vòng lặp delay không hoạt động như khi chạy bình thường.

Và mình vô tình gọi print_flag() khi stop, thế là flag lòi ra =)))

## Lời kết
Chúc các bạn đánh CTF vui vẻ!!!







