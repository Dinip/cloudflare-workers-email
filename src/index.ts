export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	DKIM_DOMAIN: string
	DKIM_SELECTOR: string
	DKIM_PRIVATE_KEY: string
	EMAIL_DEFAULT_FROM: string
	EMAIL_DEFAULT_FROMNAME: string
}


type email = {
	to: string
	from?: string
	fromName?: string
	subject: string
	html: boolean
	content: string
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		if (request.method == "POST") {
			const req = await request.json() as email
			try {
				let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
					"method": "POST",
					"headers": {
						"content-type": "application/json",
					},
					"body": JSON.stringify({
						"personalizations": [{
							"to": [{
								"email": req.to,
							}],
							"dkim_domain": env.DKIM_DOMAIN,
							"dkim_selector": env.DKIM_SELECTOR,
							"dkim_private_key": env.DKIM_PRIVATE_KEY
						}],
						"from": {
							"email": `${req.from || env.EMAIL_DEFAULT_FROM}@${env.DKIM_DOMAIN}`,
							"name": `${req.fromName || env.EMAIL_DEFAULT_FROMNAME}`,
						},
						"subject": req.subject,
						"content": [{
							"type": `${req.html ? "text/html" : "text/plain"}`,
							"value": req.content,
						}],
					}),
				});
				const res = await fetch(send_request)
				const respText = await res.text();
				return new Response("Email sent " + respText);
			} catch (err) {
				return new Response("Erro", { status: 500 });
			}
		} else {
			return new Response("Method not allowed", { status: 405 });
		}
	}
}