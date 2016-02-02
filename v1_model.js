
  const cuid   = require('cuid'); //
  const db     = require('./_db_sqlite');
  const moment = require('moment');

  const LOG_TABLE_NAME = 'lwlog';

  const STORED_PROCEDURES = {
    createLogTable : function(){
      return ["CREATE TABLE IF NOT EXISTS "+ LOG_TABLE_NAME +" (",
                "id TEXT PRIMARY KEY NOT NULL,",
                "class TEXT,",
                "ref TEXT,",
                "type TEXT NOT NULL,",
                "title TEXT NOT NULL,",
                "description TEXT,",
                "data TEXT,",
                "source TEXT NOT NULL,",
                "dstamp INTEGER",
              ");"].join(' ');
    },
    totalLogCount : function(){
      return "SELECT COUNT(id) AS total_log_entries FROM "+ LOG_TABLE_NAME +";";
    }
  };

  const FIRST_LOG_ENTRY = {
    class       : 'all',
    ref         : 'xx00',
    type        : 'information',
    title       : 'LOG_INITIALISED',
    description : 'log database created',
    data        : null,
    source      : 'local'
  };

  const ACCEPTED_POST_FIELDS = ['class', 'ref', 'type', 'title', 'description', 'data', 'source'];

  function addLogEntryIfNoneExists(){
    return new Promise((resolve, reject) => {
      logFuncs.getLogCount().then((log_count) => {
        console.log('Log count: '+ log_count);
        if(parseInt(log_count, 10) === 0){
          return logFuncs.addLog(FIRST_LOG_ENTRY);
        } else {
          return resolve();
        }
      }).then((msg) => {
        if(msg === 'LOG_ENTRY_ADDED'){ console.log('Table initialised'); }
        return resolve();
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  function prepareLogEntry(qdata, next){
    //qdata.source += ' - AT:'+ qdata.access_token; Append access_token to source
    for(let prop in qdata){
      if(ACCEPTED_POST_FIELDS.indexOf(prop) === -1){
        delete qdata[prop];
      } else {

      }
    }
    return qdata;
  }

  let logFuncs = {

    getLog : function(filter, query){
      let sql = ["SELECT * FROM "+ LOG_TABLE_NAME +" WHERE 1"];
      let parameters = {};
      return new Promise((resolve, reject) => {
        if(query.hasOwnProperty('class')){
          sql.push("AND class LIKE $class");
          parameters['$class'] = '%'+ query.class +'%';
        }
        if(query.hasOwnProperty('type')){
          sql.push("AND class LIKE $type");
          parameters['$type'] = '%'+ query.type +'%';
        }
        if(query.hasOwnProperty('source')){
          sql.push("AND class LIKE $source");
          parameters['$source'] = '%'+ query.source +'%';
        }
        if(query.hasOwnProperty('startdate')){ sql.push("AND dstamp >= "+ moment(query.startdate, "YYYY-MM-DD").unix()); }
        if(query.hasOwnProperty('enddate')){   sql.push("AND dstamp < "+ moment(query.enddate, "YYYY-MM-DD").unix()); }
        if(filter){
          if(filter === 'newest' || filter === 'latest'){ sql.push('ORDER BY dstamp DESC LIMIT 0,1'); }
          if(filter === 'oldest'){ sql.push('ORDER BY dstamp ASC LIMIT 0,1'); }
        } else {
          if(query.hasOwnProperty('sortby')){
            sql.push('ORDER BY $sortby');
            parameters['$sortby'] = query.sortby;
          } else { sql.push('ORDER BY dstamp DESC'); }
        }
        db.dbGetAll(sql.join(' ')+';', parameters).then((rows) => {
          return (filter ? resolve(rows[0]) : resolve(rows));
        }).catch((err) => { return reject(err); });
      });
    },

    getLogCount : function(){
      return new Promise((resolve, reject) => {
        db.dbGetSingleField(STORED_PROCEDURES.totalLogCount(), {}, 'total_log_entries').then((log_count) => {
          return resolve(log_count);
        }).catch((err) => { return reject(err); });
      });
    },

    addLog : function(qdata){
      qdata = prepareLogEntry(qdata);
      return new Promise((resolve, reject) => {
        qdata.id     = cuid();
        qdata.dstamp = Math.floor(Date.now() / 1000);
        db.dbInsert(LOG_TABLE_NAME, qdata).then(() => {
          return resolve('LOG_ENTRY_ADDED');
        }).catch((err) => { return reject(err); });
      });
    },

    setup : function(){
      return new Promise((resolve, reject) => {
        Promise.all([db.dbRun(STORED_PROCEDURES.createLogTable(), 'Database initialised'), addLogEntryIfNoneExists()]).then(() => {
          return resolve();
        }).catch((err) => { return reject(err); });
      });
    }

  };

  module.exports = logFuncs;
