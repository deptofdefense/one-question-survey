

const params = {};
const query = window.location.search.split(/\?/);
if (query && query[1]) {
  query[1].split(/\&/).forEach((p) => {
    const data = p.split(/\=/).map((s) => { return decodeURIComponent(s); });
    params[data[0]] = data[1];
  });
}

document.querySelector('.message').innerText = params.message || '';
