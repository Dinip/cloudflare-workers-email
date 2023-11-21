export class GenericResponse extends Response {
  constructor(message: string, status: number) {
    super(message, { status })
  }
}

export class OK extends GenericResponse {
  constructor(message = 'OK') {
    super(message, 200)
  }
}

export class BadRequestError extends GenericResponse {
  constructor(message = 'Bad request') {
    super(message, 400)
  }
}

export class UnauthorizedError extends GenericResponse {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class MethodNotAllowedError extends GenericResponse {
  constructor(message = 'Method not allowed') {
    super(message, 405)
  }
}

export class InternalServerError extends GenericResponse {
  constructor(message = 'Internal server error') {
    super(message, 500)
  }
}
