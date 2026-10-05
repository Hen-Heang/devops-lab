import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApplication } from './app.js';

const { app, metricsApp, registry } = createApplication();
let server;
let metricsServer;
let applicationUrl;
let metricsUrl;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  metricsServer = metricsApp.listen(0, '127.0.0.1');
  await Promise.all(
    [server, metricsServer].map(
      (s) => new Promise((resolve) => s.once('listening', resolve))
    )
  );
  applicationUrl = `http://127.0.0.1:${server.address().port}`;
  metricsUrl = `http://127.0.0.1:${metricsServer.address().port}`;
});
after(async () => {
  await Promise.all(
    [server, metricsServer].map(
      (s) => new Promise((resolve) => s.close(resolve))
    )
  );
  registry.clear();
});
test('application health responds while public metrics are not served', async () => {
  const health = await fetch(`${applicationUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');
  assert.equal((await fetch(`${applicationUrl}/metrics`)).status, 404);
});
test('counter and histogram are exported with stable route labels', async () => {
  await fetch(`${applicationUrl}/users/1`);
  await fetch(`${applicationUrl}/users/999`);
  const response = await fetch(`${metricsUrl}/metrics`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/plain/);
  const metrics = await response.text();
  assert.match(
    metrics,
    /http_requests_total\{method="GET",route="\/users\/:id",status="200"\} 1/
  );
  assert.match(
    metrics,
    /http_requests_total\{method="GET",route="\/users\/:id",status="404"\} 1/
  );
  assert.match(metrics, /http_request_duration_seconds_bucket/);
  assert.doesNotMatch(metrics, /route="\/users\/999"/);
});
test('unmatched URLs share one bounded label instead of arbitrary paths', async () => {
  await fetch(`${applicationUrl}/missing-one`);
  await fetch(`${applicationUrl}/missing-two`);
  const metrics = await (await fetch(`${metricsUrl}/metrics`)).text();
  assert.match(metrics, /route="unmatched"/);
  assert.doesNotMatch(metrics, /route="\/missing-(one|two)"/);
});
