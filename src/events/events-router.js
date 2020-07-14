const path = require('path')
const express = require('express')

const EventsService = require('./events-service')

const eventsRouter = express.Router()
const jsonParser = express.json()

const serializeEvent = event => ({
	id: event.id,
	event_name: event.event_name,
	start_date: event.start_date,
	end_date: event.end_date,
	event_type: event.event_type,
	location_address: event.location_address,
	location_city: event.location_city,
	location_zipcode: event.location_zipcode,
})

eventsRouter
  .route('/')
  .get( (req, res, next) => {
	const knexInstance = req.app.get('db')
	EventsService.getAllUpcomingEvents(knexInstance)
	  .then(events => {
		res.json(events.map(serializeEvent))
	  })
	  .catch(next)
  })
