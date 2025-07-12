# My Impact Frontend

This project is the Frontend of a Full-Stack Application using React.js as a frontend and Express.js as a backend. The backend uses sequelize to communicate with a relational database that is deployed seperately.

## Prerequesites

- [nodejs](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository:

    ```bash
   git clone git@github.com:waynedevilliers/my-impact-frontend.git
   cd my-impact-frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

## Running the Application

To start the application, both front- and backend must be running simultaneously. To set up the backend use the following commands:

1. Run the application:

    ```bash
    npm run dev
    ```

The Frontend will start running on [http://localhost:5173](http://localhost:5173)

## Configuration

Environment-specific configurations can be set in `.env` file. take a look at the `example.env` file.

Create a new `.env` file and then copy the contents of `example.env` into it, make sure to fill out the link to your backend application on the `VITE_BACKEND` value.
