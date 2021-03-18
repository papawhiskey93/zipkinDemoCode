const express = require('express');
const app = express();
const { Tracer } = require('zipkin');       
const { BatchRecorder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls'); 
const ctxImpl = new CLSContext();
const fetch = require('node-fetch');
const wrapFetch = require('zipkin-instrumentation-fetch');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const {KafkaLogger} = require('zipkin-transport-kafka');
const noop = require('noop-logger');
const {
  Tracer11,
  BatchRecorder11,
  jsonEncoder: {JSON_V2}
} = require('zipkin');
const recorder = new BatchRecorder({
    
	logger: new KafkaLogger({
		clientOpts: {
			connectionString: '192.168.1.22:2181'
		} ,
    encoder: JSON_V2, // optional (defaults to THRIFT)
    log: noop
	})
  
});

const tracer = new Tracer({ ctxImpl, recorder });

app.use(zipkinMiddleware({
  tracer,
  serviceName: 'name_service' // name of this application
}));


// app.get('/', (req, res) => {
//   res.send('Hello Zipkin');
// });


const server = app.listen(8000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('name_service listening at http://%s:%s', host, port);
});


const zipkinFetch = wrapFetch(fetch, {
  tracer,
  serviceName: 'name_service'
});



app.get('/', (req, res) => {
    Promise.all([
      zipkinFetch('http://localhost:8010'),
      zipkinFetch('http://localhost:8020')
    ])
    .then(([ first, last ]) => {
      return Promise.all([
        first.text(),
        last.text()
      ]);  
    })
    .then(([ first, last ]) => {
      res.send(`${first} ${last}`);
    })
    .catch(err => res.sendStatus(500));
  });
