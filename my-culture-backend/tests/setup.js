
import { sequelize } from '../db.js';
import setupApp from '../app.js';
import supertest from 'supertest';

let request;
let server;

beforeAll(async () => {
  const app = await setupApp();
  server = app.listen(4000); // Use a different port for testing
  request = supertest(app);
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await sequelize.close();
});

export { request };
