import http from 'k6/http';
import { sleep, check } from 'k6';

const routes = [
  { name: 'inicio',          url: 'http://localhost:4173/ecocampus/' },
  { name: 'calculadora',     url: 'http://localhost:4173/ecocampus/calculadora' },
  { name: 'mapa',            url: 'http://localhost:4173/ecocampus/mapa' },
  { name: 'comunidad',       url: 'http://localhost:4173/ecocampus/comunidad' },
  { name: 'guia-reciclaje',  url: 'http://localhost:4173/ecocampus/guia-reciclaje' },
];

export const options = {
  stages: [
    { duration: '10s', target: 10  },
    { duration: '30s', target: 50  },
    { duration: '10s', target: 0   },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed:   ['rate<0.05'],
  },
};

export default function loadTest() {
  // eslint-disable-next-line no-undef
  const route = routes[(__VU + __ITER) % routes.length];

  const res = http.get(route.url, {
    tags: { route: route.name },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body not empty': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
