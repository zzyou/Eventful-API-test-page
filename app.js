const inquirer = require('inquirer');
const connection = require('./connection');
const eventSearch = require('./eventfulAPI');

const app = {};
app.startQuestion = (closeConnectionCallback) => {
  inquirer.prompt({
    type: 'list',
    message: 'What action would you like to do?',
    choices: [
      'Complete a sentence',
      'Create a new user',
      'Find one event of a particular type in San Francisco next week',
      'Mark an existing user to attend an event in database',
      'See all events that a particular user is going to',
      'See all the users that are going to a particular event',
      'Exit'
    ],
    name:'action',
  }).then((res) => {
    const continueCallback = () => app.startQuestion(closeConnectionCallback);

    if (res.action === 'Complete a sentence') app.completeSentence(continueCallback);
    if (res.action === 'Create a new user') 
      app.createNewUser().then((result) => {
          console.log('Your info has been saved to the database.');
        }).catch((err) => {
          console.log(err);
        }).then(() => continueCallback());
    if (res.action === 'Find one event of a particular type in San Francisco next week') app.searchEventful(continueCallback);
    if (res.action === 'Mark an existing user to attend an event in database') app.matchUserWithEvent(continueCallback);
    if (res.action === 'See all events that a particular user is going to') app.seeEventsOfOneUser(continueCallback);
    if (res.action === 'See all the users that are going to a particular event') app.seeUsersOfOneEvent(continueCallback);
    if (res.action === 'Exit') {
      closeConnectionCallback();
      return;
    }
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
  return inquirer.prompt({
    type: 'input',
    message: 'What kind of event do you want to search?',
    name: 'keyword'
  }).then((res) => {
    console.log('You are searching for ' + res.keyword + '.');

    eventSearch(res.keyword, (newEvent) => {
      inquirer.prompt({
        type: 'confirm',
        message: 'Do you want to save this event? Y/N',
        'default': false,
        name: 'saveToDB'
      })
      .then((res) => {
        if (res.saveToDB === true) {
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
    });
  })
  .catch(err => {
    console.log(err);
  })
}

app.matchUserWithEvent = (continueCallback) => {
  //YOUR WORK HERE

  console.log('Please write code for this function');
  //End of your work
  continueCallback();
}

app.seeEventsOfOneUser = (continueCallback) => {
  //YOUR WORK HERE

  console.log('Please write code for this function');
  //End of your work
  continueCallback();
}

app.seeUsersOfOneEvent = (continueCallback) => {
  //YOUR WORK HERE

  console.log('Please write code for this function');
  //End of your work
  continueCallback();
}

module.exports = app;
