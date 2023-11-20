# DKIM Key Generation and DNS Record Setup

## Instructions

### Step 1: Generate DKIM Key Pair

Run the following commands in your terminal to generate a DKIM key pair:

```bash
openssl genrsa 2048 | tee priv_key.pem | openssl rsa -outform der | openssl base64 -A > priv_key_base64.txt
```
```bash
echo -n "v=DKIM1; k=rsa; p=" > pub_key_record.txt && \
openssl rsa -in priv_key.pem -pubout -outform der | openssl base64 -A >> pub_key_record.txt
```

These commands will generate a private key (`priv_key.pem`) and a public key record (`pub_key_record.txt`). It will also generate a private key (`priv_key_base64.txt`) in base64 format will be used in the `wrangler.toml` file.

You will need the content from the `pub_key_record.txt` file in Step 2 and the content from the `priv_key_base64.txt` file in Step 5.

### Step 2: DNS TXT Record Setup

Add the following DNS TXT record to your domain's DNS settings:

```plaintext
<selector>._domainkey IN TXT "<content of the file pub_key_record.txt>"
```

Replace `<selector>` with a selector name of your choice. Just remember to use the same selector name when you set up your wrangler.toml file with the DKIM_SELECTOR variable.

Replace `<content of the file pub_key_record.txt>` with the actual content of the `pub_key_record.txt` file generated in Step 1.

### Example:

```plaintext
mailchannelsworker._domainkey IN TXT "v=DKIM1; k=rsa p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3mG4eLSu5Rvx6HGN8jOGlFqC75kC8zNtewXFNlrFnz9lfFkDI+1C4olQ+8H1OpCo4m77LU/NKzS1Koy5Cn/nLhn5oTwEx1DfU3//yCj5mQWYpTfbI1U/8OjGMepxJ2tXGh+sBK28Kvs0zhdDwjCkY3bT+1aZuKhELeWyETiTQIDAQAB"
```

### Step 3: Configure SPF Records

Add `include:relay.mailchannels.net` to your domain's SPF record DNS entries. The final SPF record should look like this:

```plaintext 
<example.com> IN TXT "v=spf1 a mx include:relay.mailchannels.net -all"
```

Replace `<example.com>` with your actual domain name.

### Step 4: Add TXT Mailchannels Auth Record for Cloudflare Workers

Add the following DNS TXT record to your domain's DNS entries:

```plaintext
_mailchannels.example.com IN TXT "v=mc1 cfid=<account-subdomain>"
```

You can find your account-subdomain at [dash.cloudflare.net](dash.cloudflare.net) at the right side on the to Workers & Pages tab.

### Step 5: Wrangler.toml Setup

You should configure your `wrangler.toml` file with the following variables:

```plaintext
DKIM_DOMAIN = "<example.com>" # your domain name

DKIM_SELECTOR = "<selector>" # same selector name used in Step 2

DKIM_PRIVATE_KEY = "<content of the file priv_key_base64.txt>" # from Step 1

EMAIL_DEFAULT_FROM = <noreply>@example.com # left side of your default from email address, don't include the domain name

EMAIL_DEFAULT_FROMNAME = "Noreply My Domain" # your default from display name

AUTH_TOKEN = "<auth-token>" # an internal token to protect your email API endpoint.
```
In your client application you will need to send this token in the Authorization header. `Authorization: <auth-token>`.

You can generate a random token with the following command: `openssl rand -base64 32`

# Example API Request Body

```json
{
 "to": [
  {
  	"email": "test@example.com"
  }
 ],
 "cc": [
  {
  	"email": "cc@example.com"
  }
 ],
 "subject": "Testing workers email",
 "content": "This is a simple email with no HTML content."
}

{
 "to": [
  {
  	"email": "test@example.com"
  }
 ],
 "subject": "Testing workers email",
 "html": true,
 "content": "<div style='color: red;'>A simple HTML string</div>"
}
```


# For more information visit the following links:
https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown-

https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature

https://support.mailchannels.com/hc/en-us/articles/200262610-Set-up-SPF-Records