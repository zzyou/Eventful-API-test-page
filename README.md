# Event Search Application for Terminal
Node, Inquirer, MySQL, Eventful API, Eventful Node.

- Created a terminal application with node, inquirer, MySQL, eventful API, Eventful Node.
- Features include creating new user, searching for events, searching for users.

##

## How to Set Up MySQL Database:
- `brew install mysql`, install mysql.
- `brew services start mysql`, start mysql.
- Download and install Sequel Pro (http://www.sequelpro.com/).
- Open Sequel Pro, and create a connection using `Host: 127.0.0.1` and `Username: root`.
- After the connection, add a database named `eventonica`.
- Inside `eventonica` database, create three tables named `Users`, `Events`, `SelectedEvents`.
- For `Users` table, add two columns : `name`, `email`.
- For `Events` table, add six columns : `title`, `time`, `venue`, `address`, `keyword`, `eventid`.
- For `SelectedEvents` table, add two columns: `userid`, `eventid`.

##

## How to Set Up This Application in Terminal:
Before you start, please request an API key from eventful (http://api.eventful.com/).

- `git clone https://github.com/zzyou/Eventful-API-test-page.git`, clone this repo to your computer.
- `cd Eventful-API-test-page`, change directory to this repo in your computer.
- `touch keys.js`, create a new file named keys.js.
- Open keys.js in your text editor, and put the following code in the file:
- `module.exports = {
    "eventful": 'Your-API-Key-Goes-Here', 
    "mySql": ''
};`
- `npm install`, install all node modules.
- `node index.js`, have fun!
