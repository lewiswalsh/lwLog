
  const config  = require('./config');
  const sqlite3 = require('sqlite3').verbose();

  const sqliteDB = new sqlite3.Database(config.database);

  module.exports = {

    dbGetAll : function(sql){
      return new Promise((resolve, reject) => {
        sqliteDB.all(sql, (err, rows) => {
          if(err){ return reject(err); }
          return resolve(rows);
        });
      });
    },

    dbGetSingle : function(sql){
      return new Promise((resolve, reject) => {
        sqliteDB.get(sql, (err, row) => {
          if(err){ return reject(err); }
          return resolve(row);
        });
      });
    },

    dbGetSingleField : function(sql, field){
      let _self = this;
      return new Promise((resolve, reject) => {
        _self.dbGetSingle(sql).then((row) => {
          return resolve(row[field])
      }).catch((err) => { return reject(err); });
      });
    },

    dbInsert : function(table, qdata){
      return new Promise((resolve, reject) => {
        let placeholder_keys = [];
        let placeholders     = {};
        let key_string       = [];
        Object.getOwnPropertyNames(qdata).forEach((v, i, a) => {
          let key = '$'+ v;
          placeholder_keys.push(key);
          placeholders[key] = qdata[v];
          key_string.push(v);
        });
        let sql = "INSERT INTO "+ table +" ("+ key_string.join(',') +") VALUES ("+ placeholder_keys.join(',') +");";
        let stmt = sqliteDB.prepare(sql);
        stmt.run(placeholders, (err) => {
          if(err){ return reject(err); }
          return resolve();
        });
      });
    },

    dbRun : function(sql, conlog){
      return new Promise((resolve, reject) => {
        sqliteDB.serialize(() => {
          sqliteDB.run(sql, (err) => {
            if(err){ return reject(err); }
            if(conlog){ console.log(conlog); }
            return resolve();
          });
        });
      });
    }

  }
