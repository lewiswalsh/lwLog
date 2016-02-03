
  const config     = require('./config');
  const mLog       = require('./v1_model');
  const bodyparser = require('body-parser');

  module.exports.route = (app, express) => {

    let route = express.Router();
    app.use('/v1', route); // use '/xxxx' to set base for all routes

    route.use(bodyparser.json());   // to support JSON-encoded bodies
    route.use(bodyparser.urlencoded({ extended : true })); // to support URL-encoded bodies

    // CORS
    route.use(function(req, res, next) {
      if(config.enable_cors){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      }
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
      return res.status(500).jsonp({error:"that won't work"});
    });

    route.get('/log/:filter?', (req, res, next) => {
      mLog.getLog(req.params.filter, req.query).then((log) => {
        return res.status(200).jsonp(log);
      }).catch((err) => { return res.status(500).jsonp({error:err}); });
    });

    route.post('/log', (req, res, next) => {
      mLog.addLog(req.body).then((lastID, msg) => {
        if(msg){ console.log(msg); }
        res.status(200).jsonp({success:"log entry added",lastID:lastID});
      }).catch((err) => { return res.status(500).jsonp({error:err}); });
    });

  }
