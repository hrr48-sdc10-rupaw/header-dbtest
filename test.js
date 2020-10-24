import http from 'k6/http';
import k6 from 'k6';

const url = 'http://localhost:3001/api/hero/all_info/';

export default function() {
  http.get(url + Math.floor(Math.random() * 10000000));
  k6.sleep(1);
};