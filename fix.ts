import https from 'https';
https.get('https://affilishop-web-262317503159.asia-southeast1.run.app/api/sync-data', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
