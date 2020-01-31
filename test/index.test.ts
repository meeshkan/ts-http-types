import {
  HttpExchange,
  HttpExchangeReader,
  HttpRequestBuilder,
  HttpResponseBuilder,
  HttpMethod
} from "../src/index";

test("HttpRequest building from code", () => {
  const method = HttpMethod.GET;
  const request1 = new HttpRequestBuilder().withMethod(method).build();
  expect(request1.method).toBe(HttpMethod.GET);
  expect(request1.body).toBeUndefined();

  const request2 = new HttpRequestBuilder()
    .withMethod(HttpMethod.POST)
    .withBody("hello, world")
    .build();
  expect(request2.method).toBe(HttpMethod.POST);
  expect(request2.body).toBe("hello, world");
});

test("HttpExchange building from code", () => {
  const request = new HttpRequestBuilder().withMethod(HttpMethod.GET).build();
  const response = new HttpResponseBuilder().withStatusCode(200).build();
  const exchange = new HttpExchange(request, response);

  expect(exchange.request.method).toBe(HttpMethod.GET);
  expect(exchange.response.statusCode).toBe(200);
});

test("Http exchanges from JSON", () => {
  const json = `{
    "request": {
      "method": "post"
    },
    "response": {
      "statusCode": 404
    }
  }`;

  const exchange = HttpExchangeReader.fromJson(json);
  expect(exchange.request.method).toBe(HttpMethod.POST);
  expect(exchange.response.statusCode).toBe(404);
});
