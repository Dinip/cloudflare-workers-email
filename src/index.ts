import {
  BadRequestError,
  GenericResponse,
  InternalServerError,
  MethodNotAllowedError,
  OK,
  UnauthorizedError
} from './responses'
import { Email, Env } from './types'

// MailChannels API docs: https://api.mailchannels.net/tx/v1/documentation

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method != 'POST') return new MethodNotAllowedError()

    const auth = request.headers.get('Authorization')
    const token = auth?.includes(' ') ? auth?.split(' ')[1] : auth
    if (token != env.AUTH_TOKEN) return new UnauthorizedError()

    for (const [key, value] of Object.entries(env)) {
      if (!value)
        return new InternalServerError(`Env variable ${key} is not set`)
    }

    try {
      const { from, fromName, to, cc, bcc, replyTo, subject, content, html } =
        await request.json<Email>()

      if (!to) return new BadRequestError('No recipient')
      if (!subject) return new BadRequestError('No subject')
      if (!content) return new BadRequestError('No content')

      const send_request = new Request(
        'https://api.mailchannels.net/tx/v1/send',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [
              {
                to,
                cc,
                bcc,
                reply_to: replyTo,
                dkim_domain: env.DKIM_DOMAIN,
                dkim_selector: env.DKIM_SELECTOR,
                dkim_private_key: env.DKIM_PRIVATE_KEY
              }
            ],
            from: {
              email: `${from || env.EMAIL_DEFAULT_FROM}@${env.DKIM_DOMAIN}`,
              name: fromName || env.EMAIL_DEFAULT_FROMNAME
            },
            subject,
            content: [
              {
                type: html ? 'text/html' : 'text/plain',
                value: content
              }
            ]
          })
        }
      )

      const res = await fetch(send_request)
      if (!res.ok) return new GenericResponse('External API error', res.status)
      return new OK()
    } catch (err) {
      console.error(err)
      return new InternalServerError()
    }
  }
}
