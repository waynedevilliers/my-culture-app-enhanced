# Musik Leben Backend

This project is the Backend of a Full-Stack Application using React.js as a frontend and Express.js as a backend. The backend uses sequelize to communicate with a relational database that is deployed seperately.

## Prerequesites

- [nodejs](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:reneSpeaks/musik-leben-backend.git
   cd musik-leben-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running the Application

To start the application, both front- and backend must be running simultaneously. To set up the backend use the following commands:

1. Run the application:

    ```bash
    npm run server
    ```

The Backend will start running on [http://localhost:3001](http://localhost:3001)

2. Fill your database with preliminary data:

    ```bash
    npm run seed
    ```

## Configuration

Environment-specific configurations can be set in `.env` file. take a look at the `example.env` file.

Create a new `.env` file and then copy the contents of `example.env` into it, you may change the `PORT` and `SECRET` value.
Make sure to fill in a relational database connection string on the `DB` value and the `CLOUD` values for the file upload.

To make the Newsletter system work, it needs environment variables for `URL`, `EMAIL_PORT`, `EMAIL_HOST`, `EMAIL_USER` as well as an `EMAIL_PASS` and `EMAIL_FROM` value. 
