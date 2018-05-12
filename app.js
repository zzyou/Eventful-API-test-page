const inquirer = require('inquirer');
const connection = require('./connection');
const eventSearch = require('./eventfulAPI');

const app = {};
app.startQuestion = (closeConnectionCallback) => {
  const actions = [
    'Complete a sentence',
    'Create a new user',
    'Find one event of a particular type in San Francisco next week',
    'Mark an existing user to attend an event in database',
    'See all events that a particular user is going to',
    'See all the users that are going to a particular event',
    'Exit'
  ];

  inquirer.prompt({
    type: 'list',
    message: 'What action would you like to do?',
    choices: actions,
    name:'action',
  }).then((res) => {
    const continueCallback = () => app.startQuestion(closeConnectionCallback);

    switch (res.action) {
      case actions[0]:
        app.completeSentence(continueCallback);
        break;
      case actions[1]:
        app.createNewUser().then((result) => {
          console.log('Your info has been saved to the database.');
        }).catch((err) => {
          console.log(err);
        }).then(() => continueCallback());
        break;
      case actions[2]:
        app.searchEventful(continueCallback);
        break;
      case actions[3]:
        app.matchUserWithEvent(continueCallback);
        break;
      case actions[4]:
        app.seeEventsOfOneUser(continueCallback);
        break;
      case actions[5]:
        app.seeUsersOfOneEvent(continueCallback);
        break;
      default:
        closeConnectionCallback();
    }

    // if (res.action === actions[0]) app.completeSentence(continueCallback);
    // if (res.action === actions[1]) 
    //   app.createNewUser().then((result) => {
    //       console.log('Your info has been saved to the database.');
    //     }).catch((err) => {
    //       console.log(err);
    //     }).then(() => continueCallback());
    // if (res.action === actions[2]) app.searchEventful(continueCallback);
    // if (res.action === actions[3]) app.matchUserWithEvent(continueCallback);
    // if (res.action === actions[4]) app.seeEventsOfOneUser(continueCallback);
    // if (res.action === actions[5]) app.seeUsersOfOneEvent(continueCallback);
    // if (res.action === actions[6]) {
    //   closeConnectionCallback();
    //   return;
    // }
  })
}

const getUserName = () => {
  return inquirer.prompt([{
    type: 'input',
    message: 'What is your name?',
    name: 'name'
  }, {
    type: 'input',
    message: 'What is your email?',
    name: 'email'
  }]);
};

const promisedQuery = (query, arg) => {
  return new Promise((resolve, reject) => {
    connection.query(query, arg, function(err, result, field) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

let username;
let useremail;

app.completeSentence = (continueCallback) => {
  getUserName().then((res) => {
    username = res.name;
    useremail = res.email;
    console.log('Your name is: ' + username + '. Your email is: ' + useremail + '.');
    continueCallback();
  }).catch((err) => {
    console.log(err);
  })
}

app.createNewUser = () => {
  let newuser = {};

  if (username && useremail) {
    newuser.name = username;
    newuser.email = useremail;  
    return promisedQuery('INSERT INTO users SET ?', newuser);
  }

  return getUserName().then((res) => {
    newuser.name = username = res.name;
    newuser.email = useremail = res.email;      
    console.log('Your name is: ' + username + '. Your email is: ' + useremail + '.');
    return promisedQuery('INSERT INTO users SET ?', newuser);
  })
}

app.searchEventful = (continueCallback) => {
  inquirer.prompt({
    type: 'input',
    message: 'What kind of event do you want to search?',
    name: 'keyword'
  }).then((res) => {
    console.log('You are searching for ' + res.keyword + '.');

    eventSearch(res.keyword, (newEvent) => {
      if (!newEvent) {
        console.log('No event about ' + res.keyword + ' has been found. Please use another keyword.');
        app.searchEventful(continueCallback);
      }

      else {
        inquirer.prompt({
          type: 'confirm',
          message: 'Do you want to save this event? Y/N',
          'default': false,
          name: 'saveToDB'
        })
        .then((res) => {
          if (res.saveToDB) {
            connection.query('INSERT INTO events SET ?', newEvent, function (err, result, field) {
              if (err) throw err;
              console.log('Your event has been saved to the database.');
              continueCallback();
            })
          }
          else {
            app.searchEventful(continueCallback);
          }
        })
        .catch(err => {
          console.log(err);
        })
      }           
    });
  })
  .catch(err => {
    console.log(err);
  })
}

const parseResults = (inputs, version) => {
  let items = JSON.parse(JSON.stringify(inputs));
  console.log(items);

  let results = [];
  for (let item of items) {
    let row = `${item.id} || `;
    if (version === 'users') {
      row += `${item.email}`;
    } else {
      row += `${item.title}`;
    }
    results.push(row);
  }

  return results;
}

app.matchUserWithEvent = (continueCallback) => {
  connection.query('SELECT * FROM users', function (err, result, field) {
    if (err) throw err;

    let userInfo = [];
    for (let obj of result) {
      userInfo.push(`${obj.id} || ${obj.name} || ${obj.email}`);
    }

    inquirer.prompt({
      type: 'list',
      message: 'Which one is your name and email?',
      choices: userInfo,
      name: 'selectUser'
    }).then(userRes => {
      console.log('Your name and email: ' + userRes.selectUser);
      const userId = userRes.selectUser.split(' || ')[0];

      connection.query('SELECT * FROM events', function (err, result, field) {
        if (err) throw err;

        let eventInfo = [];
        for (let obj of result) {
          eventInfo.push(`${obj.id} || ${obj.title} || ${obj.time} || ${obj.venue}`);
        }

        inquirer.prompt({
          type: 'list',
          message: 'Which event do you want to attend?',
          choices: eventInfo,
          name: 'selectEvent'
        }).then(eventRes => {
          console.log('Your event: ' + eventRes.selectEvent);
          const eventId = eventRes.selectEvent.split(' || ')[0];

          const userEvent = {userId: userId, eventId: eventId};

          connection.query('INSERT INTO selectedevents SET ?', userEvent, function(err, result, field) {
            if (err) throw err;
            console.log('Your selection has been saved to the database.');

            continueCallback();
          })
        }).catch(err => {
          console.log(err);
        }) 
      })
    }).catch(err => {
      console.log(err);
    })
  })
}

app.seeEventsOfOneUser = (continueCallback) => {
  connection.query('SELECT * FROM users', function (err, result, field) {
    if (err) throw err;

    let userInfo = [];
    for (let obj of result) {
      userInfo.push(`${obj.id} || ${obj.name} || ${obj.email}`);
    }

    inquirer.prompt({
      type: 'list',
      message: 'Select an user to see the user\'s event(s).',
      choices: userInfo,
      name: 'selectUser'
    }).then(userRes => {
      console.log('You are searching user: ' + userRes.selectUser);
      const userArr = userRes.selectUser.split(' || ');
      const userId = userArr[0];
      const userName = userArr[1];

      const eventQuery = 'SELECT * FROM selectedevents AS s JOIN events AS e WHERE s.userid = ? AND s.eventid = e.id';

      connection.query(eventQuery, userId, function(err, result, fields) {
        if (err) throw err;

        if (result.length === 0) {
          console.log('No event found for ' + userName + '. Please try another user.');
          app.seeEventsOfOneUser(continueCallback);
        }
        else {
          console.log(userName + ' is going to the following event(s):');

          result.forEach(obj => {
            console.log("===========================================================");
            console.log('Name: ', obj.title);
            console.log('Time: ', obj.time);
            console.log('Venue: ', obj.venue);
            console.log('Address: ', obj.address);
          });
          
          continueCallback();
        }      
      });
    }).catch(err => {
      console.log(err);
    })
  })
}

app.seeUsersOfOneEvent = (continueCallback) => {
  connection.query('SELECT * FROM events', function (err, result, field) {
    if (err) throw err;

    let eventInfo = [];
    for (let obj of result) {
      eventInfo.push(`${obj.id} || ${obj.title} || ${obj.time} || ${obj.venue}`);
    }

    inquirer.prompt({
      type: 'list',
      message: 'Select an event to see its attendee(s)',
      choices: eventInfo,
      name: 'selectEvent'
    }).then(eventRes => {
      const eventArr = eventRes.selectEvent.split(' || ');
      const eventId = eventArr[0];
      const eventName = eventArr[1];

      console.log('You are searching event: ' + eventName + '.');

      const userQuery = 'SELECT * FROM selectedevents AS s JOIN users AS u WHERE s.eventid = ? AND s.userid = u.id';

      connection.query(userQuery, eventId, function(err, result, fields) {
        if (err) throw err;

        if (result.length === 0) {
          console.log('No user found for event ' + eventName + '. Please try another event.');
          app.seeUsersOfOneEvent(continueCallback);
        }
        else {
          console.log('Attendee(s) of Event ' + eventName + ': ');

          result.forEach(obj => {
            console.log("===========================================================");
            console.log('Name: ', obj.name);
            console.log('Email: ', obj.email);
          });
          
          continueCallback();
        }   
      });
    }).catch(err => {
      console.log(err);
    })
  })
}

module.exports = app;
