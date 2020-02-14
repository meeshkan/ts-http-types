# HTTP Types in TypeScript
[![Build Status](https://github.com/Meeshkan/ts-http-types/workflows/Node.js%20CI/badge.svg)](https://github.com/Meeshkan/ts-http-types/actions?query=workflow%3A%22Node.js+CI%22)
[![MIT licensed](http://img.shields.io/:license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/http-types)](https://npmjs.org/http-types)

Typescript library to read and write records of HTTP exchanges in the [HTTP types](https://meeshkan.github.io/http-types/) format.

## Install
```sh
$ npm install http-types
```

# Writing HTTP exchanges
Using `HttpExchangeWriter` a recording of HTTP traffic can be serialised for use with any program that can handle the HTTP Types format.
```typescript
const writer = new HttpExchangeWriter();

const request = HttpRequestBuilder.fromPath({
  timestamp: timestamp,
  method: HttpMethod.GET,
  protocol: HttpProtocol.HTTPS,
  host: "example.com",
  headers: {
    "accept-encoding": "gzip, deflate, br",
    "cache-control": ["no-cache", "no-store"]
  },
  path: "/my/path?a=b&q=1&q=2",
  body: "request string body"
});

const response = HttpResponseBuilder.from({
  headers: {
    "accept-encoding": "gzip, deflate, br",
    "cache-control": "no-cache"
  },
  statusCode: 404,
  body: "response string body"
});

writer.write({ request, response });

// [...] (write multiple exchanges)

// writer.buffer contains the exchanges in the HTTP types JSON Lines format.
console.log(writer.buffer);
```

A HTTP request can also be created from query parameters as an object. The below request is identical to the one created above:

```typescript
const request = HttpRequestBuilder.fromPathnameAndQuery({
  timestamp: timestamp,
  method: HttpMethod.GET,
  protocol: HttpProtocol.HTTPS,
  host: "example.com",
  headers: {
    "accept-encoding": "gzip, deflate, br",
    "cache-control": ["no-cache", "no-store"]
  },
  pathname: "/my/path",
  query: {
    a: "b",
    q: ["1", "2"]
  },
  body: "request string body"
});
```

# Reading HTTP exchanges
With `HttpExchangeReader` HTTP Types recordings can be read for processing:
```typescript
HttpExchangeReader.fromJsonLines(writer.buffer, exchange => {
  expect(exchange.request.host).toBe("example.com");
  expect(exchange.request.query.get("a")).toEqual("b");
});
```
