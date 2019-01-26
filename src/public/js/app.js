
// Insert message if we have one
const params = {};
const query = window.location.search.split(/\?/);
if (query && query[1]) {
  query[1].split(/\&/).forEach((p) => {
    const data = p.split(/\=/).map((s) => { return decodeURIComponent(s); });
    params[data[0]] = data[1];
  });
}
document.querySelector('.message').innerText = params.message || '';

// Handle client info
if (localStorage.getItem('client')) {
  document.querySelector('[name="client"]').value = localStorage.getItem('client');
} else {
  localStorage.setItem('client', document.querySelector('[name="client"]').value);
}
if (localStorage.getItem('name')) {
  document.querySelector('[name="name"]').value = localStorage.getItem('name');
} else {
  document.querySelector('section.name label').innerText = 'Hi! Either we haven\'t seen you before, or we just can\'t remember you. Can you tell us your name?';
}
document.querySelector('[name="name"]').addEventListener('blur', (e) => {
  localStorage.setItem('name', e.target.value);
});
