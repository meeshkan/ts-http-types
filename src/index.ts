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
  HTTP = "HTTP",
  /** Encrypted HTTPS protocol. */
  HTTPS = "HTTPS"
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

/** HTTP request query parameters. */
export class HttpQueryParameters {
  private parameters: Map<string, string[]>;

  constructor(parameters?: { string: string | string[] }) {
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
  headers: HttpHeaders;
  body?: string;
  path: string;
}

/** HTTP request. */
export interface HttpRequestFromPathNameAndQuery {
  timestamp?: Date;
  method: HttpMethod;
  protocol: HttpProtocol;
  host: string;
  headers: HttpHeaders;
  body?: string;
  pathname: string;
  query: { string: string | string[] };
}

export class HttpRequestBuilder {
  static build(requestData: HttpRequestFromPath): HttpRequest {
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

    return {
      timestamp: requestData.timestamp,
      method: requestData.method,
      protocol: requestData.protocol,
      host: requestData.host,
      headers: requestData.headers,
      body: requestData.body,
      path: requestData.path,
      pathname: url.pathname,
      query: query
    };
  }
  static buildFromPathnameAndQuery(
    requestData: HttpRequestFromPathNameAndQuery
  ): HttpRequest {
    let path = requestData.pathname;
    if (requestData.query) {
      path += "?";
      let first = true;
      for (const key in requestData.query) {
        const value = requestData.query[key];
        if (value instanceof String) {
          if (first) {
            first = false;
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
            } else {
              path += "&";
            }
            path += encodeURIComponent(key) + "=" + encodeURIComponent(entry);
          }
        }
      }
    }

    const query = new HttpQueryParameters(requestData.query);

    return {
      timestamp: requestData.timestamp,
      method: requestData.method,
      protocol: requestData.protocol,
      host: requestData.host,
      headers: requestData.headers,
      body: requestData.body,
      path: path,
      pathname: requestData.pathname,
      query: query
    };
  }
}

export interface HttpResponse {
  timestamp?: Date;
  statusCode: number;
  headers: HttpHeaders;
  body?: string;
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
    const requestHeaders: HttpHeaders = new HttpHeaders(parsedRequest.headers);

    let request: HttpRequest;

    if (parsedRequest.path) {
      request = HttpRequestBuilder.build({
        timestamp: requestTimestamp,
        method: method,
        protocol: protocol,
        host: parsedRequest.host,
        headers: requestHeaders,
        body: parsedRequest.body,
        path: parsedRequest.path
      });
    } else if (parsedRequest.pathname) {
      request = HttpRequestBuilder.buildFromPathnameAndQuery({
        timestamp: requestTimestamp,
        method: method,
        protocol: protocol,
        host: parsedRequest.host,
        headers: requestHeaders,
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
      timestamp: responseTimestamp,
      statusCode: parsedResponse.statusCode,
      headers: responseHeaders,
      body: parsedResponse.body
    };

    return { request, response };
  }
}
