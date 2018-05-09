const eventfulKey = require("./keys.js").eventful;
const eventful = require('eventful-node');
const client = new eventful.Client(eventfulKey);

// //sample search, try running it to see it in action
// client.searchEvents({
//   keywords: 'tango',
//   location: 'San Francisco',
//   date: "Next Week"
// }, function(err, data){
//    if(err){
//      return console.error(err);
//    }
//    let resultEvents = data.search.events.event;
//    console.log('Received ' + data.search.total_items + ' events');
//    console.log('Event listings: ');
//    for ( let i =0 ; i < resultEvents.length; i++){
//      console.log("===========================================================")
//      console.log('title: ',resultEvents[i].title);
//      console.log('start_time: ',resultEvents[i].start_time);
//      console.log('venue_name: ',resultEvents[i].venue_name);
//      console.log('venue_address: ',resultEvents[i].venue_address);
//    }
// });

//export a custom function that searches via Eventful API, displays the results AND stores some of the data into MySQL
function eventSearch(keyword, callback) {
  const optionObj = {
    keywords: keyword,
    location: "San Francisco",
    date: "Next Week"
  };

  client.searchEvents(optionObj, (err, data) => {
    if (err) {
      return console.error(err);
    }

    const resultEvents = data.search.events.event;

    console.log('Received ' + data.search.total_items + ' events');
    console.log('The first event: ');

    const newTitle = resultEvents[0].title;
    const newTime = resultEvents[0].start_time;
    const newVenue = resultEvents[0].venue_name;
    const newAddress = resultEvents[0].venue_address;

    console.log("===========================================================")
    console.log('title: ', newTitle);
    console.log('time: ', newTime);
    console.log('venue: ', newVenue);
    console.log('address: ', newAddress);

    const newEvent = {title: newTitle, time: newTime, venue: newVenue, address: newAddress, keyword: keyword};

    callback(newEvent);
  });
}

module.exports = eventSearch;
