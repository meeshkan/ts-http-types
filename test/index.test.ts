import {
  HttpExchange,
  HttpExchangeReader,
  HttpProtocol,
  HttpRequestBuilder,
  HttpMethod,
  HttpResponse,
  HttpHeaders
} from "../src/index";

test("HttpRequest building from code", () => {
  const method = HttpMethod.GET;
  const request1 = new HttpRequestBuilder().withMethod(method).build();
  expect(request1.method).toBe(HttpMethod.GET);
  expect(request1.body).toBeUndefined();

  const request2 = new HttpRequestBuilder()
    .withProtocol(HttpProtocol.HTTPS)
    .withMethod(HttpMethod.POST)
    .withBody("hello, world")
    .build();
  expect(request2.protocol).toBe(HttpProtocol.HTTPS);
  expect(request2.method).toBe(HttpMethod.POST);
  expect(request2.body).toBe("hello, world");
});

test("HttpResponse building from code", () => {
  const response: HttpResponse = {
    headers: new HttpHeaders(),
    statusCode: 404
  };
  expect(response.statusCode).toBe(404);
});

test("HttpExchange building from code", () => {
  const request = new HttpRequestBuilder().withMethod(HttpMethod.GET).build();
  const response: HttpResponse = {
    headers: new HttpHeaders(),
    statusCode: 200
  };
  const exchange = new HttpExchange(request, response);

  expect(exchange.request.method).toBe(HttpMethod.GET);
  expect(exchange.response.statusCode).toBe(200);
});

test("Http exchanges from JSON", () => {
  const json = `{
    "request": {
      "protocol": "https",
      "timestamp": "2018-11-13T20:20:39+02:00",
      "method": "post",
      "headers": {
        "accept": "*/*",
        "multi-value": ["value1", "value2"]
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

  expect(exchange.request.timestamp).toEqual(
    new Date("2018-11-13T20:20:39+02:00")
  );
  expect(exchange.request.protocol).toBe(HttpProtocol.HTTPS);
  expect(exchange.request.method).toBe(HttpMethod.POST);
  expect(exchange.request.headers.get("accept")).toBe("*/*");
  expect(exchange.request.headers.get("multi-value")).toBe("value1");
  expect(exchange.request.headers.getAll("multi-value")).toEqual([
    "value1",
    "value2"
  ]);
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
