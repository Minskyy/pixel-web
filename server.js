const express = require('express');
const app = express();

const forceSsl = require('force-ssl-heroku');

app.use(forceSsl);

app.use(express.static('./dist/pixel'));

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: 'dist/pixel/'}
);
});

app.listen(process.env.PORT || 8080, () => {
  console.log('listening', process.env.PORT || 8080);
});
