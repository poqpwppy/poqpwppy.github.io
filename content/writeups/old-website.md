---
title: Old Website - BushBash CTF 2026
date: 2026-08-03 19:00:00 +0700
categories: [Web Exploitation, Writeups, Medium, BushBash CTF 2026]
tags: [web, react2shell, nextjs, prototype-pollution, rce, medium, bushbashctf2026]
author: khoa
description: We found this website running using one of cybervillain Zoowee Blubberworth's old domain names. He's supposed to be in jail right now so there's really no reason why this server could be up and running. It probably hasn't been updated in a year or so. Can you hack in and have a peek around?
toc: true
comments: true
---

## Challenge Overview

We are presented with a web application running at `http://34.40.133.67:8080` belonging to "Zoowee Blubberworth". The homepage renders a simple UI displaying: *"Zoowee Blubberworth's epic website"* and *"No content loaded - database offline"*. 

Given the challenge hint that the server hasn't been updated in over a year, our goal is to investigate outdated dependencies—specifically targeting Next.js React Server Components (RSC) Remote Code Execution vulnerabilities.

## Reconnaissance

First, let's inspect the target using `curl` or Burp Suite to analyze the HTTP response headers and application technology stack.

![Reconnaissance](https://i.postimg.cc/Gcxj99d7/image-2026-08-03-185151862.png)
_Initial response headers inspection_

Key observations from the response:
- **`X-Powered-By: Next.js`**: Confirms the application is built on the Next.js framework.
- **`Vary: RSC, Next-Router-State-Tree...`**: Indicates the application uses the Next.js **App Router** with **React Server Components (RSC)** enabled.

## Vulnerability Discovery

### 1. Confirming RSC Support
To confirm that the server processes React Server Components data, we send a `GET` request containing the `RSC: 1` header to request raw component data instead of standard HTML:

![Confirm the RSC](https://i.postimg.cc/qRZYCx6h/image-2026-08-03-190042167.png)
_Confirming React Flight stream response_

The server responds with `Content-Type: text/x-component` alongside a serialized React Flight component tree. This verifies that RSC processing is actively handling requests.

### 2. Probing Server Actions
Next.js processes Server Actions via the `Next-Action` HTTP header. We test sending a `POST` request with `Content-Type: multipart/form-data` and a dummy `Next-Action` header to check how the parser handles incoming RSC form payloads:

![Found the vuln](https://i.postimg.cc/3RM0rPnG/image-2026-08-03-185627147.png)
_Triggering 500 Internal Server Error via RSC deserialization_

The application responds with a `500 Internal Server Error` containing an RSC error stream payload (`text/x-component`). This behavior strongly indicates that the server is using an unpatched Next.js version vulnerable to **React2Shell** (tracked under **CVE-2025-55182** / **CVE-2025-66478**).

## Exploitation

By crafting a multipart RSC payload, we can pollute prototype properties (`__proto__:then`) during deserialization and inject Node.js code into the `_response` context, which gets executed via `child_process.execSync`.

### Step 1: Arbitrary Code Execution (`whoami`)

We send an exploit payload attempting to run `whoami` and exfiltrate the output Base64-encoded inside the error's `digest` property:

![RCE Successfully](https://i.postimg.cc/Y0Y5Kmjy/image-2026-08-03-190232638.png)
_Executing whoami command_

The server returns a JSON error chunk containing:
```text
1:E{"digest":"bm9kZQo="}
```

Decoding `bm9kZQo=` from Base64 gives:
```bash
$ echo "bm9kZQo=" | base64 -d
node
```
We have achieved Remote Code Execution as the `node` user!

### Step 2: Listing Directory Contents (`ls`)

Next, we execute `ls` to view the files present in the current working directory:

![Try ls command](https://i.postimg.cc/K8z0tMxX/image-2026-08-03-190420359.png)
_Listing files in the application root_

Decoding the returned `digest` string:
```bash
$ echo "YXBwCm5vZGVfbW9kdWxlcwpwYWNrYWdlLWxvY2sanNvbgpwYWNrYWdlLmpzb24Kem9vd2VlX21lc3NhZ2UudHh0Cg==" | base64 -d
app
node_modules
package-lock.json
package.json
zoowee_message.txt
```

We notice a suspicious file named `zoowee_message.txt`.

### Step 3: Extracting the Flag

Finally, we update the payload command to `cat zoowee_message.txt`:

![Found the flag](https://i.postimg.cc/ydzhpg4k/image-2026-08-03-190548164.png)
_Reading zoowee_message.txt_

Decoding the returned Base64 string:
```bash
$ echo "YnVzaGJhc2h7eW91V2lsbE5ldmVyQ2F0Y2hNZSFJRHVnQVR1bm5lbE91dH0K" | base64 -d
bushbash{youWillNeverCatchMe!IDugATunnelOut}
```

**Flag:** `bushbash{youWillNeverCatchMe!IDugATunnelOut}`

---

## Technical Deep Dive: React2Shell Mechanism

The **React2Shell** vulnerability stems from a flaw in how Next.js deserializes React Flight streams in Server Actions:

1. **Server Action Interception**: The `Next-Action` header informs Next.js to parse incoming form fields as Server Action arguments using React's Flight deserializer.
2. **Prototype Pollution**: The payload injects `{"then":"$1:__proto__:then"}` along with `status: "resolved_model"`. When Next.js parses these fields, it pollutes the Promise/Object prototype chain in the Node.js runtime.
3. **Payload Injection & Execution**: The `_response._prefix` property is assigned custom JavaScript code. During response serialization after an internal state error, Next.js evaluates this prefix in the global server context:
   ```javascript
   var res = process.mainModule.require("child_process").execSync("cat zoowee_message.txt").toString("base64");
   throw Object.assign(new Error("x"), { digest: res });
   ```
4. **Data Exfiltration via Digest**: The thrown exception catches the command output, encodes it in Base64, and places it into the `digest` field. Next.js formats this error into a `text/x-component` response, streaming the exfiltrated data back to the client without requiring Out-Of-Band (OOB) connections.

---

## Mitigation & Remediation

To secure Next.js applications against React2Shell / RSC RCE vulnerabilities:

1. **Update Framework Dependencies**: Upgrade `next` to the latest patched release (v14.2.25+, v15.1.0+ or higher).
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```
2. **Disable Unused Server Actions**: If Server Actions are not required by your application, disable them in `next.config.js`:
   ```javascript
   module.exports = {
     experimental: {
       serverActions: false,
     },
   };
   ```
3. **WAF Rules & Input Validation**: Deploy Web Application Firewall (WAF) rules to inspect `Next-Action` requests and block payloads containing prototype pollution indicators (`__proto__`, `constructor`, `prototype`).

---

## Conclusion

This challenge demonstrates the danger of running unmaintained web frameworks in production. By leveraging the **React2Shell** vulnerability in Next.js App Router, we exploited RSC deserialization to achieve full Remote Code Execution on the target system and retrieved the flag.

Have a nice day :Đ.