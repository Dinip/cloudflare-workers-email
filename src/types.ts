export interface Env {
  DKIM_DOMAIN: string
  DKIM_SELECTOR: string
  DKIM_PRIVATE_KEY: string
  EMAIL_DEFAULT_FROM: string
  EMAIL_DEFAULT_FROMNAME: string
  AUTH_TOKEN: string
}

type SendTo = {
  email: string
  name?: string
}

export type Email = {
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
