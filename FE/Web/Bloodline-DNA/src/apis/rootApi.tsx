import axios from 'axios';

const rootApi = axios.create({
  baseURL: 'https://api.adntester.duckdns.org/api',
});

export default rootApi;

export const BASE_URL = "https://api.adntester.duckdns.org/api";