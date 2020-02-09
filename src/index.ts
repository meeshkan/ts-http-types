/** HTTP request method to indicate the desired action to be performed for a given resource. */
export enum HttpMethod {
  /** The CONNECT method establishes a tunnel to the server identified by the target resource. */
  CONNECT = "connect",
  /** The DELETE method deletes the specified resource. */
  DELETE = "delete",
  /** The GET method requests a representation of the specified resource. Requests using GET should only retrieve data. */
  GET = "get",
  /** The HEAD method asks for a response identical to that of a GET request, but without the response body. */
  HEAD = "head",
  /** The OPTIONS method is used to describe the communication options for the target resource. */
  OPTIONS = "options",
  /** The PATCH method is used to apply partial modifications to a resource. */
  PATCH = "patch",
  /** The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server. */
  POST = "post",
  /** The PUT method replaces all current representations of the target resource with the request payload. */
  PUT = "put",
  /** The TRACE method performs a message loop-back test along the path to the target resource. */
  TRACE = "trace"
}

/** HTTP request protocol. */
export enum HttpProtocol {
  /** Unencrypted HTTP protocol. */
  HTTP = "http",
  /** Encrypted HTTPS protocol. */
  HTTPS = "https"
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

  toJSON(): object {
    const result = {};
    this.headers.forEach((value, key) => {
      result[key] =
        value instanceof Array && value.length == 1 ? value[0] : value;
    });
    return result;
  }
}

/** HTTP request query parameters. */
export class HttpQueryParameters {
  private parameters: Map<string, string[]>;

  constructor(parameters?: { [name: string]: string | string[] }) {
    if (parameters) {
      this.parameters = new Map<string, string[]>();
      Object.keys(parameters).forEach(parameterName => {
        let values: string | string[] = parameters[parameterName];
        if (typeof values === "string") {
          values = [values];
        }
        if (values.length > 0) {
          this.parameters.set(parameterName.toLowerCase(), values);
        }
      });
    } else {
      this.parameters = new Map<string, string[]>();
    }
  }

  /**
   * The first parameter value for the given parameter name, if any.
   *
   * @param parameterName The parameter name.
   *
   * @returns The first parameter value, or null if none.
   * @see #getAll
   */
  get(parameterName: string): string | null {
    const values = this.parameters.get(parameterName.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }

  /**
   * All parameter values for the given parameter name.
   *
   * @param parameterName The parameter name.
   *
   * @returns a list of parameter values, or an empty list if none
   * @see #get
   */
  getAll(parameterName: string): string[] {
    return (
      this.parameters.get(parameterName.toLowerCase()) || new Array<string>()
    );
  }

  toJSON(): object {
    const result = {};
    this.parameters.forEach((value, key) => {
      result[key] =
        value instanceof Array && value.length == 1 ? value[0] : value;
    });
    return result;
  }
}

/** HTTP request. */
export interface HttpRequest {
  timestamp?: Date;
  method: HttpMethod;
  protocol: HttpProtocol;
  host: string;
  headers: HttpHeaders;
  body?: string;
  path: string;
  pathname: string;
  query: HttpQueryParameters;
}

/** HTTP request. */
export interface HttpRequestFromPath {
  timestamp?: Date;
  method: HttpMethod;
  protocol: HttpProtocol;
  host: string;
  headers: { [name: string]: string | string[] };
  body?: string;
  path: string;
}

/** HTTP request. */
export interface HttpRequestFromPathNameAndQuery {
  timestamp?: Date;
  method: HttpMethod;
  protocol: HttpProtocol;
  host: string;
  headers: { [name: string]: string | string[] };
  body?: string;
  pathname: string;
  query: { [name: string]: string | string[] };
}

function validateRequest(request: HttpRequest): void {
  for (const requiredProperty of [
    "method",
    "protocol",
    "host",
    "headers",
    "pathname",
    "query"
  ]) {
    if (!request[requiredProperty]) {
      throw Error(`request.${requiredProperty} is required`);
    }
  }
}

export class HttpRequestBuilder {
  static fromPath(requestData: HttpRequestFromPath): HttpRequest {
    const url = new URL("file://" + requestData.path);

    const queryMap = new Object();
    const queryString = url.search.substring(1);
    for (const entry of queryString.split("&")) {
      const pair = entry.split("=");
      const parameterName = decodeURIComponent(pair[0]);
      const parameterValue = decodeURIComponent(pair[1]);

      let existingEntry = queryMap[parameterName] as string[];
      if (!existingEntry) {
        existingEntry = new Array<string>();
        queryMap[parameterName] = existingEntry;
      }
      existingEntry.push(parameterValue);
    }
    const query = new HttpQueryParameters(
      queryMap as { string: string | string[] }
    );

    const request = {
      timestamp: requestData.timestamp ? requestData.timestamp : undefined,
      method: requestData.method,
      protocol: requestData.protocol,
      host: requestData.host,
      headers: new HttpHeaders(requestData.headers),
      body: requestData.body,
      path: requestData.path,
      pathname: url.pathname,
      query: query
    };
    validateRequest(request);
    return request;
  }
  static fromPathnameAndQuery(
    requestData: HttpRequestFromPathNameAndQuery
  ): HttpRequest {
    let path = requestData.pathname;
    if (requestData.query) {
      let first = true;
      for (const key in requestData.query) {
        const value = requestData.query[key];
        if (value instanceof String) {
          if (first) {
            first = false;
            path += "?";
          } else {
            path += "&";
          }
          path +=
            encodeURIComponent(key) +
            "=" +
            encodeURIComponent(value.toString());
        } else {
          for (const entry of value) {
            if (first) {
              first = false;
              path += "?";
            } else {
              path += "&";
            }
            path += encodeURIComponent(key) + "=" + encodeURIComponent(entry);
          }
        }
      }
    }

    const query = new HttpQueryParameters(requestData.query);

    const request = {
      timestamp: requestData.timestamp ? requestData.timestamp : undefined,
      method: requestData.method,
      protocol: requestData.protocol,
      host: requestData.host,
      headers: new HttpHeaders(requestData.headers),
      body: requestData.body,
      path: path,
      pathname: requestData.pathname,
      query: query
    };
    validateRequest(request);
    return request;
  }
}

export interface HttpResponse {
  timestamp?: Date;
  statusCode: number;
  headers: HttpHeaders;
  body?: string;
}

export interface HttpResponseData {
  timestamp?: Date | string;
  statusCode: number | string;
  headers: { [name: string]: string | string[] };
  body?: string;
}

export class HttpResponseBuilder {
  static from(responseData: HttpResponseData): HttpResponse {
    let timestamp;
    if (responseData.timestamp instanceof Date) {
      timestamp = responseData.timestamp;
    } else if (responseData.timestamp != null) {
      timestamp = Date.parse(responseData.timestamp);
    } else {
      timestamp = undefined;
    }
    let statusCode;
    if (typeof responseData.statusCode === "string") {
      statusCode = parseInt(responseData.statusCode);
    } else {
      statusCode = responseData.statusCode;
    }

    return {
      timestamp: timestamp,
      statusCode: statusCode,
      headers: new HttpHeaders(responseData.headers),
      body: responseData.body
    };
  }
}

export interface HttpExchange {
  request: HttpRequest;
  response: HttpResponse;
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

    let request: HttpRequest;

    if (parsedRequest.path) {
      request = HttpRequestBuilder.fromPath({
        timestamp: requestTimestamp,
        method: method,
        protocol: protocol,
        host: parsedRequest.host,
        headers: parsedRequest.headers,
        body: parsedRequest.body,
        path: parsedRequest.path
      });
    } else if (parsedRequest.pathname) {
      request = HttpRequestBuilder.fromPathnameAndQuery({
        timestamp: requestTimestamp,
        method: method,
        protocol: protocol,
        host: parsedRequest.host,
        headers: parsedRequest.headers,
        body: parsedRequest.body,
        pathname: parsedRequest.pathname,
        query: parsedRequest.query
      });
    } else {
      throw new Error("Either 'path' or 'pathname' is required");
    }

    const responseTimestamp = parsedResponse.timestamp
      ? new Date(parsedResponse.timestamp)
      : null;
    const responseHeaders: HttpHeaders = new HttpHeaders(
      parsedResponse.headers
    );

    const response: HttpResponse = {
      timestamp: responseTimestamp ? responseTimestamp : undefined,
      statusCode: parsedResponse.statusCode,
      headers: responseHeaders,
      body: parsedResponse.body
    };

    return { request, response };
  }

  static fromJsonLines(
    jsonLines: string,
    callback: (exchange: HttpExchange) => void
  ): void {
    jsonLines.split("\n").forEach(line => {
      if (line.length > 0) {
        const exchange = HttpExchangeReader.fromJson(line);
        callback(exchange);
      }
    });
  }
}

export class HttpExchangeWriter {
  buffer = "";
  write(exchange: HttpExchange): void {
    this.buffer += JSON.stringify(exchange) + "\n";
  }
}
