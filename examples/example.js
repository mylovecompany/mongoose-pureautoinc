/**
 * @author Dmitry Ilin @ MyLove Company, LLC <dmitry@mylovecompany.com>
 */

var dbName      = 'pureautoinc_example',
	mongoose    = require('../node_modules/mongoose'),
	Schema      = mongoose.Schema,
	db          = mongoose.createConnection('127.0.0.1', dbName),
	pureautoinc = require('../index');

pureautoinc.init(db);


var schema = new Schema({
	name:    String,
	address: String
});

schema.plugin(pureautoinc.plugin, {
	model: 'Person',
	field: 'filingNumber',
	start: 100
});

var Person = db.model('Person', schema);

console.log('Database:   ' + dbName);
console.log('Collection: ' + Person.collection.name);

var person = new Person({
	name:    'Sherlock Holmes',
	address: '221b Baker St, Marylebone, London W1'
});

person.save(function (err, res) {

	console.log('New record added:');
	console.log(res);
	mongoose.disconnect();
});