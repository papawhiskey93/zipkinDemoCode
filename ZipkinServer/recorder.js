const { BatchRecorder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const {KafkaLogger} = require('zipkin-transport-kafka');
const {
  Tracer11,
  BatchRecorder11,
  jsonEncoder: {JSON_V2}
} = require('zipkin');

const noop = require('noop-logger');
module.exports = new BatchRecorder({
  
  logger: new KafkaLogger({
    clientOpts: {
      connectionString: '192.168.1.22:2181'
    },
    encoder: JSON_V2, // optional (defaults to THRIFT)
    log: noop
  })
});