/** HTTP request method to indicate the desired action to be performed for a given resource. */
export enum HttpMethod {
  /** The CONNECT method establishes a tunnel to the server identified by the target resource. */
  CONNECT = "CONNECT",
  /** The DELETE method deletes the specified resource. */
  DELETE = "DELETE",
  /** The GET method requests a representation of the specified resource. Requests using GET should only retrieve data. */
  GET = "GET",
  /** The HEAD method asks for a response identical to that of a GET request, but without the response body. */
  HEAD = "HEAD",
  /** The OPTIONS method is used to describe the communication options for the target resource. */
  OPTIONS = "OPTIONS",
  /** The PATCH method is used to apply partial modifications to a resource. */
  PATCH = "PATCH",
  /** The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server. */
  POST = "POST",
  /** The PUT method replaces all current representations of the target resource with the request payload. */
  PUT = "PUT",
  /** The TRACE method performs a message loop-back test along the path to the target resource. */
  TRACE = "TRACE"
}

/** HTTP request protocol. */
export enum HttpProtocol {
  /** Unencrypted HTTP protocol. */
  HTTP,
  /** Encrypted HTTPS protocol. */
  HTTPS
}

/** HTTP request. */
export class HttpRequest {
  method: HttpMethod;
  body?: string;

  public constructor(builder: HttpRequestBuilder) {
    this.method = builder.method;
    this.body = builder.body;
  }
}

export class HttpRequestBuilder {
  method?: HttpMethod;
  body?: string;

  withMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  withBody(body: string): this {
    this.body = body;
    return this;
  }

  build(): HttpRequest {
    return new HttpRequest(this);
  }
}

export class HttpResponse {
  statusCode?: number;
  body?: string;

  constructor(builder: HttpResponseBuilder) {
    this.statusCode = builder.statusCode;
    this.body = builder.body;
  }
}

export class HttpResponseBuilder {
  statusCode?: number;
  body?: string;

  withStatusCode(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  withBody(body: string): this {
    this.body = body;
    return this;
  }

  build(): HttpResponse {
    return new HttpResponse(this);
  }
}

export class HttpExchange {
  constructor(public request: HttpRequest, public response: HttpResponse) {
    this.request = request;
    this.response = response;
  }
}

export class HttpExchangeReader {
  static fromJson(json: string): HttpExchange {
    const parsedObject = JSON.parse(json);
    const parsedRequest = parsedObject.request;
    const parsedResponse = parsedObject.response;

    console.log("method= " + parsedRequest.method);
    const method: HttpMethod =
      HttpMethod[(parsedRequest.method as string).toUpperCase()];
    const request = new HttpRequestBuilder().withMethod(method).build();

    const response = new HttpResponseBuilder()
      .withStatusCode(parsedResponse.statusCode)
      .build();

    return new HttpExchange(request, response);
  }
}
