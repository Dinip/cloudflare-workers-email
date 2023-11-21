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

These commands will generate a private key (`priv_key.pem`) and a public key record (`pub_key_record.txt`). It will also generate a private key (`priv_key_base64.txt`) in base64 format that will be used in the `wrangler.toml` file.

You will need the content from the `pub_key_record.txt` file in [Step 2](#step-2-dns-txt-record-setup) and the content from the `priv_key_base64.txt` file in [Step 5](#step-5-wranglertoml-setup).

### Step 2: DNS TXT Record Setup

Add the following DNS TXT record to your domain's DNS settings:

```plaintext
<selector>._domainkey IN TXT "<content of the file pub_key_record.txt>"
```

Replace `<selector>` with a selector name of your choice. Just remember to use the same selector name when you set up your wrangler.toml file with the DKIM_SELECTOR variable.

Replace `<content of the file pub_key_record.txt>` with the actual content of the `pub_key_record.txt` file generated in [Step 1](#step-1-generate-dkim-key-pair).

### Example:

```plaintext
mailchannelsworker._domainkey IN TXT "v=DKIM1; k=rsa p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3mG4eLSu5Rvx6HGN8jOGlFqC75kC8zNtewXFNlrFnz9lfFkDI+1C4olQ+8H1OpCo4m77LU/NKzS1Koy5Cn/nLhn5oTwEx1DfU3//yCj5mQWYpTfbI1U/8OjGMepxJ2tXGh+sBK28Kvs0zhdDwjCkY3bT+1aZuKhELeWyETiTQIDAQAB"
```

### Step 3: Configure SPF Records

Add `include:relay.mailchannels.net` to your domain's SPF record DNS entries.

**If you already have an email provider working, be careful when updating your spf record. You just need to add `include:relay.mailchannels.net` before the `-all` or `~all` part, at the end of your already existing record.**

A final **example** of a SPF record could look like this:

```plaintext
<example.com> IN TXT "v=spf1 a mx include:relay.mailchannels.net -all"
```

Replace `<example.com>` with your actual domain name.

If you already have a SPF record, you can add `include:relay.mailchannels.net` to the existing SPF record. For example:

```plaintext
v=spf1 include:eu.mailgun.org include:relay.mailchannels.net -all
```

### Step 4: Add TXT Mailchannels Auth Record for Cloudflare Workers

Add the following DNS TXT record to your domain's DNS entries:

```plaintext
_mailchannels.<example.com> IN TXT "v=mc1 cfid=<account-subdomain>"
```

Replace `<example.com>` with your actual domain name.

Replace `<account-subdomain>` with your account subdomain. You can find the subdomain at [dash.cloudflare.com](https://dash.cloudflare.com/) at the right side of the Workers & Pages tab. Might be something like `username.workers.dev`.

### Step 5: Wrangler.toml Setup

You should configure your `wrangler.toml` file with the following variables:

```toml
DKIM_DOMAIN = "<example.com>" # Your domain name
DKIM_SELECTOR = "<selector>" # Same selector name used in Step 2
DKIM_PRIVATE_KEY = "<content of the file priv_key_base64.txt>" # From Step 1
EMAIL_DEFAULT_FROM = "<from>" # Left side of your default "from email address", don't include the domain name. For example, to send emails from noreply@example.com, you should set this as "noreply"
EMAIL_DEFAULT_FROMNAME = "<from name>" # Your default from display name, something like "No Reply Example"
AUTH_TOKEN = "<auth-token>" # An internal token to protect your email API endpoint
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
