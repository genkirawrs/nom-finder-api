const express = require('express');
const knex = require('knex')
const app = express();

const { PORT, DATABASE_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.set('db', db);


app.get('/api/*', (req, res) => {
   res.json({ok: true});
});



app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};
