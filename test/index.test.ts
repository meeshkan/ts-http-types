import {
  HttpExchangeReader,
  HttpProtocol,
  HttpMethod,
  HttpResponseBuilder,
  HttpRequestBuilder,
  HttpExchangeWriter
} from "../src/index";

import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

function validateHttpTypesJson(json: string): void {
  const ajv = new Ajv({ allErrors: true });
  const schema = fs.readFileSync(
    path.join(__dirname, "http-types-schema.json"),
    "utf-8"
  );

  const valid = ajv.validate(JSON.parse(schema), JSON.parse(json));
  if (!valid) {
    throw new Error(ajv.errorsText(ajv.errors));
  }
}

test("Building exchange from path", () => {
  const timestamp = new Date();
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

  const request2 = HttpRequestBuilder.fromPathnameAndQuery({
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

  expect(request).toEqual(request2);

  const response = HttpResponseBuilder.from({
    headers: {
      "accept-encoding": "gzip, deflate, br",
      "cache-control": "no-cache"
    },
    statusCode: 404,
    body: "response string body"
  });

  const writer = new HttpExchangeWriter();
  writer.write({ request, response });
  writer.write({ request: request2, response });

  let count = 0;
  HttpExchangeReader.fromJsonLines(writer.buffer, exchange => {
    validateHttpTypesJson(JSON.stringify(exchange));
    expect(exchange.request.host).toBe("example.com");
    expect(exchange.request.query.get("a")).toEqual("b");
    count++;
  });
  expect(count).toBe(2);
});

test("Http exchanges from JSON with path", () => {
  const json = `{
    "request": {
      "protocol": "https",
      "host": "example.com",
      "timestamp": "2018-11-13T20:20:39+02:00",
      "method": "post",
      "headers": {
        "accept": "*/*",
        "multi-value": ["value1", "value2"]
      },
      "path": "/a/path?a=b&v=1&v=2",
      "body": "a request body"
    },
    "response": {
      "timestamp": "2019-11-13T20:20:39+02:00",
      "statusCode": 404,
      "headers": {
        "content-length": "15",
        "Upper-Case": "yes"
      },
      "body": "a response body"
    }
  }`;

  const exchange = HttpExchangeReader.fromJson(json);
  validateHttpTypesJson(JSON.stringify(exchange));

  expect(exchange.request.timestamp).toEqual(
    new Date("2018-11-13T20:20:39+02:00")
  );
  expect(exchange.request.method).toBe(HttpMethod.POST);
  expect(exchange.request.protocol).toBe(HttpProtocol.HTTPS);
  expect(exchange.request.host).toBe("example.com");
  expect(exchange.request.headers.get("accept")).toBe("*/*");
  expect(exchange.request.headers.get("multi-value")).toBe("value1");
  expect(exchange.request.headers.getAll("multi-value")).toEqual([
    "value1",
    "value2"
  ]);
  expect(exchange.request.path).toBe("/a/path?a=b&v=1&v=2");
  expect(exchange.request.pathname).toBe("/a/path");
  expect(exchange.request.query.get("a")).toBe("b");
  expect(exchange.request.query.get("v")).toBe("1");
  expect(exchange.request.query.getAll("v")).toEqual(["1", "2"]);
  expect(exchange.request.body).toBe("a request body");

  expect(exchange.response.timestamp).toEqual(
    new Date("2019-11-13T20:20:39+02:00")
  );
  expect(exchange.response.statusCode).toBe(404);
  expect(exchange.response.headers.get("content-length")).toBe("15");
  expect(exchange.response.headers.get("Upper-Case")).toBe("yes");
  expect(exchange.response.headers.get("upper-case")).toBe("yes");
  expect(exchange.response.body).toBe("a response body");
});

test("Http exchanges from JSON with pathname and query", () => {
  const json = `{
    "request": {
      "protocol": "https",
      "host": "example.com",
      "timestamp": "2018-11-13T20:20:39+02:00",
      "method": "post",
      "headers": {
        "accept": "*/*",
        "multi-value": ["value1", "value2"]
      },
      "pathname": "/a/path",
      "query": {
        "a": "b",
        "v": ["1", "2"]
      },
      "body": "a request body"
    },
    "response": {
      "timestamp": "2019-11-13T20:20:39+02:00",
      "statusCode": 404,
      "headers": {
        "content-length": "15",
        "Upper-Case": "yes"
      },
      "body": "a response body"
    }
  }`;

  const exchange = HttpExchangeReader.fromJson(json);
  validateHttpTypesJson(JSON.stringify(exchange));

  expect(exchange.request.path).toBe("/a/path?a=b&v=1&v=2");
  expect(exchange.request.query.get("a")).toBe("b");
  expect(exchange.request.query.get("v")).toBe("1");
  expect(exchange.request.query.getAll("v")).toEqual(["1", "2"]);
});

test("Http exchanges from JSON with pathname and no query parameter", () => {
  const json = `{
    "request": {
      "protocol": "https",
      "host": "example.com",
      "timestamp": "2018-11-13T20:20:39+02:00",
      "method": "post",
      "headers": {
        "accept": "*/*",
        "multi-value": ["value1", "value2"]
      },
      "pathname": "/a/path",
      "query": {},
      "body": "a request body"
    },
    "response": {
      "timestamp": "2019-11-13T20:20:39+02:00",
      "statusCode": 404,
      "headers": {
        "content-length": "15",
        "Upper-Case": "yes"
      },
      "body": "a response body"
    }
  }`;
  const exchange = HttpExchangeReader.fromJson(json);
  validateHttpTypesJson(JSON.stringify(exchange));

  expect(exchange.request.path).toBe("/a/path");
});

test("Http exchanges from JSON with pathname and single query parameter as array", () => {
  const json = `{
    "request": {
      "protocol": "https",
      "host": "example.com",
      "timestamp": "2018-11-13T20:20:39+02:00",
      "method": "post",
      "headers": {
        "accept": "*/*",
        "multi-value": ["value1", "value2"]
      },
      "pathname": "/a/path",
      "query": {"a": ["b"]},
      "body": "a request body"
    },
    "response": {
      "timestamp": "2019-11-13T20:20:39+02:00",
      "statusCode": 404,
      "headers": {
        "content-length": "15",
        "Upper-Case": "yes"
      },
      "body": "a response body"
    }
  }`;
  const exchange = HttpExchangeReader.fromJson(json);
  validateHttpTypesJson(JSON.stringify(exchange));
  expect(exchange.request.pathname).toBe("/a/path");
  expect(exchange.request.query.get("a")).toBe("b");
  expect(JSON.parse(JSON.stringify(exchange))["request"]["query"]["a"]).toBe(
    "b"
  );
});

test("Correct case of HTTP method and protocol", () => {
  const request = HttpRequestBuilder.fromPathnameAndQuery({
    method: HttpMethod.GET,
    protocol: HttpProtocol.HTTPS,
    host: "example.com",
    pathname: "/my/path",
    query: {
      a: "b",
      q: ["1", "2"]
    },
    headers: {},
    body: "request string body"
  });

  const parsedJson = JSON.parse(JSON.stringify(request));
  expect(parsedJson["method"]).toBe("get");
  expect(parsedJson["protocol"]).toBe("https");
});
