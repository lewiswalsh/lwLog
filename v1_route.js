
  const config     = require('./config');
  const mLog       = require('./v1_model');
  const bodyparser = require('body-parser');

  module.exports.route = (app, express) => {

    let route = express.Router();
    app.use('/v1', route); // use '/xxxx' to set base for all routes

    route.use(bodyparser.json());   // to support JSON-encoded bodies
    route.use(bodyparser.urlencoded({ extended : true })); // to support URL-encoded bodies

    // Allow CORS
    route.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    // Security
    route.use((req, res, next) => {
      let token;
      if(req.method === 'POST'){ token = req.body.access_token; }
      if(req.method === 'GET'){ token = req.query.access_token; }
      if(config.access_tokens.indexOf(token) !== -1){
        next(); // Authorised!
      } else {
        res.status(401).jsonp({error:"not authorised"});
      }
    });


    route.get('/', (req, res, next) => {
      //let err = new Error('This is an error!');
      //let throw_err = false;
      //if(throw_err){ return next(err); } // This passes any errors to our express error handler.
      return res.status(404).jsonp({error:"that won't work"});
    });

    route.get('/log/:filter?', (req, res, next) => {
      mLog.getLog(req.params.filter, req.query).then((log) => {
        return res.status(200).jsonp(log);
      }).catch((err) => { console.log(err); });
    });

    route.post('/log', (req, res, next) => {
      mLog.addLog(req.body).then((msg) => {
        if(msg){ console.log(msg); }
        res.status(200).jsonp({success:"log entry added"});
      });
    });

  }
