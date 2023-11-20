export interface Env {
	DKIM_DOMAIN: string
	DKIM_SELECTOR: string
	DKIM_PRIVATE_KEY: string
	EMAIL_DEFAULT_FROM: string
	EMAIL_DEFAULT_FROMNAME: string
	AUTH_TOKEN: string
}

type Email = {
	to: SendTo[]
	cc?: SendTo[]
	bcc?: SendTo[]
	from?: string
	fromName?: string
	replyTo?: string
	subject: string
	html: boolean
	content: string
}

type SendTo = {
	email: string,
	name?: string
}

//mailchannels api docs: https://api.mailchannels.net/tx/v1/documentation

export default {
	async fetch(
		request: Request,
		env: Env,
		_ctx: ExecutionContext
	): Promise<Response> {
		if (request.method != "POST") return new Response("Method not allowed", { status: 405 });
		const auth = request.headers.get("Authorization")
		if (!auth || auth == "" || auth != env.AUTH_TOKEN) return new Response("Unauthorized", { status: 401 });

		try {
			const req = await request.json() as Email

			if (!req.to) return new Response("No recipient", { status: 400 });
			if (!req.subject) return new Response("No subject", { status: 400 });
			if (!req.content) return new Response("No content", { status: 400 });

			if (req.from && !req.from.includes(`@${env.DKIM_DOMAIN}`))
				return new Response("You must use a domain that matches your DKIM domain", { status: 400 });

			const send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
				"method": "POST",
				"headers": {
					"content-type": "application/json",
				},
				"body": JSON.stringify({
					personalizations: [{
						to: req.to,
						cc: req.cc,
						bcc: req.bcc,
						reply_to: req.replyTo,
						dkim_domain: env.DKIM_DOMAIN,
						dkim_selector: env.DKIM_SELECTOR,
						dkim_private_key: env.DKIM_PRIVATE_KEY,
					}],
					from: {
						email: `${req.from || env.EMAIL_DEFAULT_FROM}@${env.DKIM_DOMAIN}`,
						name: `${req.fromName || env.EMAIL_DEFAULT_FROMNAME}`,
					},
					subject: req.subject,
					content: [{
						type: `${req.html ? "text/html" : "text/plain"}`,
						value: req.content,
					}],
				}),
			});

			const res = await fetch(send_request)
			if (!res.ok) return new Response(await res.text(), { status: res.status });
			return new Response("Email sent", { status: 200 });
		} catch (err) {
			return new Response("Error", { status: 500 });
		}
	}
}