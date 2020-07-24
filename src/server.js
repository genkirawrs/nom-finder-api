require('dotenv').config()
const express = require('express')
const knex = require('knex')
const helmet = require('helmet')
const cors = require('cors')
const app = require('./app')

const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config')

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.use(helmet())
app.use(cors())

app.set('db', db)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

