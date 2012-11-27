mongoose-pureautoinc
====================

This plugin let you add an `auto increment` field to your schema.


## Requirements

- [Node.js](http://nodejs.org/), a server-side JavaScript implementation,
- [MongoDB](http://www.mongodb.org), a NoSQL database,
- [Mongoose](http://mongoosejs.com), an elegant Object Document Mapper for MongoDB.


## Installation

Install it from NPM as you always do it with other packages.
~~~
npm install mongoose-pureautoinc
~~~


## Available options

- `model` - required parameter, name of your Mongoose model
- `field` - name of your field
- `start` - first value of your field which will be used


## How to use

You can run example using this command:
~~~
$ node examples/example.js
~~~

Firstly, you need to `require` Mongoose and the plugin.
~~~
var mongoose     = require('../node_modules/mongoose'),
    Schema       = mongoose.Schema,
    db           = mongoose.createConnection('127.0.0.1', 'yourDatabaseName'),
    pureautoinc  = require('pureautoinc');
~~~

Secondly, you need to initialize the plugin, define your schema and connect the plugin to it.
~~~
pureautoinc.init(db);

var schema = new Schema({
    email: String,
    text:  String
});

schema.plugin(pureautoinc, {
    model: 'Subscriber',
    field: 'recordNum'
});
~~~

After that you can create your model and use it as you wish.
~~~
var Subscriber = db.model('Subscriber', schema);
~~~


## For developers
You should use Git pre-hook to validate your changes. Just copy `pre-commit` file into `./git/hooks/` directory.  
In order to run tests manually execute `$ vows --spec tests/*`  
In order to test performance of the plugin execute `$ node benchmarks/benchmark.js`


## Copyright

&copy; 2012 [MyLove Company, LLC](http://www.mylovecompany.com). Source code is distributed under [CDDL 1.0](http://opensource.org/licenses/CDDL-1.0) open source license.