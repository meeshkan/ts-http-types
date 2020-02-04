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

/** HTTP request or response headers. */
export class HttpHeaders {
  private headers: Map<string, string[]>;

  constructor(headers?: { [name: string]: string | string[] }) {
    if (headers) {
      this.headers = new Map<string, string[]>();
      Object.keys(headers).forEach(headerName => {
        let values: string | string[] = headers[headerName];
        if (typeof values === "string") {
          values = [values];
        }
        if (values.length > 0) {
          this.headers.set(headerName.toLowerCase(), values);
        }
      });
    } else {
      this.headers = new Map<string, string[]>();
    }
  }

  /**
   * The first header value for the given header name, if any.
   *
   * @param headerName Header name.
   *
   * @returns The first header value, or null if none.
   * @see #getAll
   */
  get(headerName: string): string | null {
    const values = this.headers.get(headerName.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }

  /**
   * All header values for the given header name.
   *
   * @param headerName The header name.
   *
   * @returns an immutable list of header values, or an empty list if none
   * @see #get
   */
  getAll(headerName: string): string[] {
    return this.headers.get(headerName.toLowerCase()) || new Array<string>();
  }
}

/** HTTP request. */
export class HttpRequest {
  timestamp?: Date;
  protocol: HttpProtocol;
  method: HttpMethod;
  headers: HttpHeaders;
  body?: string;

  public constructor(builder: HttpRequestBuilder) {
    this.timestamp = builder.timestamp;
    this.protocol = builder.protocol;
    this.method = builder.method;
    this.headers = builder.headers;
    this.body = builder.body;
  }
}

export class HttpRequestBuilder {
  timestamp?: Date;
  protocol?: HttpProtocol;
  method?: HttpMethod;
  headers?: HttpHeaders;
  body?: string;

  withTimestamp(timestamp: Date): this {
    this.timestamp = timestamp;
    return this;
  }

  withProtocol(protocol: HttpProtocol): this {
    this.protocol = protocol;
    return this;
  }

  withMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  withBody(body: string): this {
    this.body = body;
    return this;
  }

  withHeaders(headers: HttpHeaders): this {
    this.headers = headers;
    return this;
  }

  build(): HttpRequest {
    return new HttpRequest(this);
  }
}

export interface HttpResponse {
  timestamp?: Date;
  statusCode: number;
  headers: HttpHeaders;
  body?: string;
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

    const requestTimestamp = parsedRequest.timestamp
      ? new Date(parsedRequest.timestamp)
      : null;
    const protocol: HttpProtocol =
      HttpProtocol[(parsedRequest.protocol as string).toUpperCase()];
    const method: HttpMethod =
      HttpMethod[(parsedRequest.method as string).toUpperCase()];
    const requestHeaders: HttpHeaders = new HttpHeaders(parsedRequest.headers);

    const request = new HttpRequestBuilder()
      .withTimestamp(requestTimestamp)
      .withProtocol(protocol)
      .withMethod(method)
      .withHeaders(requestHeaders)
      .withBody(parsedRequest.body)
      .build();

    const responseTimestamp = parsedResponse.timestamp
      ? new Date(parsedResponse.timestamp)
      : null;
    const responseHeaders: HttpHeaders = new HttpHeaders(
      parsedResponse.headers
    );

    const response: HttpResponse = {
      timestamp: responseTimestamp,
      statusCode: parsedResponse.statusCode,
      headers: responseHeaders,
      body: parsedResponse.body
    };

    return new HttpExchange(request, response);
  }
}
