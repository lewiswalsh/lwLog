# lwLog
A simple centralised logger as a RESTful service. Because it's just an API accessed over http you can read or write to it however you like. Data is stored in an SQLite3 database file, the name of which can be set in the config.

## Install
Download or clone somewhere. Ensure NodeJS (v4 or higher) and NPM are installed. Ensure you run `npm install` first, then launch using `node app.js` Probably best if run with [PM2](http://pm2.keymetrics.io/) or [Forever](https://github.com/foreverjs/forever).

## Config
Edit the `config.js` file

| Key | Description |
| --- | ----------- |
| database | String containing the name of the database file. If this doesn't exist it will be created. *Default: lwlog.db* |
| port | Port number the service will operate on. *Default: 3000* |
| enable_cors | Enable CORS to access this across domains. *Default: true* |
| access_tokens | This is an array of access tokens used to access the service. These are just strings, make them as long and random as you like. |

## API
For all API endpoints a property called `access_token` **must** be supplied with the value of any access token in the config array.

#### GET /v1/log
Retrieve the log. Optional parameters:

| Key | Description |
| --- | ----------- |
| class | Restrict to supplied classname |
| type | Restrict to given entry type |
| source | Restrict to given source |
| startdate | Set earliest date to return in the format `YYYY-MM-DD` |
| enddate | Set latest date to return in the format `YYYY-MM-DD` |
| search | Free text search |
| sortby | Set any field as a sort field from the POST arguments below, plus `id` or `dstamp` |


#### GET /v1/log/newest
As above, but returns only the newest entry. Takes the same filter options as above.

#### GET /v1/log/oldest
As above, but returns only the oldest entry. Takes the same filter options as above.

#### POST /v1/log
Adds a new log entry. A collision-resistant `id` and a timestamp (`dstamp`) are automatically added. The following fields are acceptable, anything else is ignored:

| Key | Description |
| --- | ----------- |
| class | Use this field to categorise log entries, such as a different class for each app you want to log from. |
| ref | A unique reference, or null. Uniqueness is not enforced. |
| type | This is the entry. Try to keep these to a minimum, such as `information`, `warning`, `error` etc. **required** |
| title | A short descriptive title of the entry. **required** |
| description | A longer description. |
| data | Any plain-text data. Such as XML or JSON. |
| source | Where the entry has come from. Could be an IP address, an APP title, a machine name. Whatever suits you. |

## Examples

**Filter by date and type and sort by source**
```
GET /v1/log?sortby=source&type=warning&startdate=2016-01-01&access_token=<my_access_token>
```

**Add new log entry**
```
POST /v1/log
{
  access_token : "<my_access_token>",
  class        : "app_one",
  ref          : "ERR043043",
  type         : "error",
  title        : "Database connection failed",
  description  : "MariaDB on localhost:3309 failed with critical error",
  data         : "1022 23000 ER_DUP_KEY Can't write; duplicate key in table 'my_table'",
  source       : "localhost"
}
```

## Todo
* Export as CSV
* Provide triggers so certain entries are emailed/POSTed elsewhere
