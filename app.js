
  const config  = require('./config');
  const mLog    = require('./v1_model');
  const express = require('express');
  const router  = require('./v1_route');

  //const express_config = require(__lib +'config/express-config');

  const app = express();

  app.use((req, res, next) => {
    console.log('%s %s', req.method, req.url);
    next();
  });

  router.route(app, express);

  // app.use(
  //   router.get('/log/stats', function *(){
  //     this.body = "Dude! Check it out";
  //   })
  // );

  mLog.setup().then(() => {
    app.listen(config.port);
    console.log('Magic happens on port '+ config.port);
  }, (err) => { console.log(err); });
