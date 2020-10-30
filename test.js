import http from 'k6/http';

const url = undefined;

export let options = {
  scenarios: {
    c100: {
      executor: 'constant-arrival-rate',
      rate: 150,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 100,
      maxVUs: 1200,
    }
  },
};

export default function() {
  http.get(`${url}/api/hero/all_info/${Math.floor(Math.random() * 10000000)}`);
};