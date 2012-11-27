/**
 * @author Dmitry Ilin @ MyLove Company, LLC <dmitry@mylovecompany.com>
 */

var mongoose    = require('../node_modules/mongoose'),
	Schema      = mongoose.Schema,
	db          = mongoose.createConnection('127.0.0.1', 'pureautoinc_benchmark'),
	pureautoinc = require('../index');

pureautoinc.init(db);


var schema = new Schema({
	email: String,
	text:  String
});

schema.plugin(pureautoinc.plugin, {
	model: 'Subscriber',
	field: 'subscriberId'
});
var Subscriber = db.model('Subscriber', schema);

var time,
	i          = 0,
	j          = 0,
	tests      = 5,
	iterations = 10000,
	results    = [];

console.log('\nIterations per test: ' + iterations + '\n');


function testsCompleted () {

	mongoose.disconnect();

	var sum = 0;
	for (var k = 0; k < results.length; k++)
		sum += results[k];

	console.log('Average time: ' + (sum / tests).toFixed(0) + ' ms\n');
}

function subscriberSaved (err, res) {

	i++;
	if (i < iterations) {
		addSubscriber();
	} else {
		results.push(new Date().getTime() - time);

		console.log((j + 1) + '. Time: ' + results[results.length - 1] + ' ms');

		j++;
		if (j < tests)
			runTest();
		else
			Subscriber.collection.drop(testsCompleted);
	}
}

function addSubscriber () {

	var subscriber = new Subscriber({
		email: 'email@mail.ru',
		text:  'text'
	});

	subscriber.save(subscriberSaved);
}

function dataRemoved () {

	time = new Date().getTime();
	i = 0;
	addSubscriber();
}

function runTest () {

	// Removing all subscribers before next test
	Subscriber.remove({}, dataRemoved);
}

runTest();