import GASClient from 'gas-client';

declare let process;
const { PORT } = process.env;

const server = new GASClient({
  // this is necessary for local development but will be ignored in production
  allowedDevelopmentDomains: `https://localhost:${PORT}`,
});

export default server;
