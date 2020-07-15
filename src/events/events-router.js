const express = require('express')
const xss = require('xss')
const EventsService = require('./events-services')

const eventsRouter = express.Router()
const jsonParser = express.json()

const serializeEvent = event => ({
	id: event.id,
	event_name: xss(event.event_name),
	start_date: event.start_date,
	end_date: event.end_date,
	event_type: event.event_type,
	location_address: xss(event.location_address),
	location_city: event.location_city,
	location_zipcode: event.location_zipcode,
})

eventsRouter
    .route('/')
    .get((req, res, next) => {
      EventsService.getAllUpcomingEvents(
        req.app.get('db')
      )
      .then(events=> {
          res.json(events.map(serializeEvent))
      })
      .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
      const { event_name, start_date, end_date, event_type, location_address, location_city, location_zipcode } = req.body
      const newEvent = { event_name, start_date, end_date, event_type, location_address, location_city, location_zipcode }
      for (const [key, value] of Object.entries(newEvent)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }
      EventsService.insertEvent(
        req.app.get('db'),
        newEvent
      )
       .then(event => {
         res
           .status(201)
           .location(`/calendar/${event.id}`)
           .json(serializeEvent(event))
       })
       .catch(next)
    })

eventsRouter
  .route('/:event_id')
    .all((req, res, next) => {
      EventsService.getEventById(
        req.app.get('db'),
        req.params.event_id
      )
        .then(event => {
          if (!event) {
            return res.status(404).json({
              error: { message: `Event doesn't exist` }
            })
          }
          res.event = event
          next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
      res.json(serializeEvent(res.event))
    })
    .delete((req, res, next) => {
      EventsService.deleteEvent(
        req.app.get('db'),
        req.params.event_id
      )
        .then(() => {
          res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
      const { event_name, start_date, end_date, event_type, location_address, location_city, location_zipcode } = req.body
      const eventToUpdate = { event_name, start_date, end_date, event_type, location_address, location_city, location_zipcode }

      const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          return res.status(400).json({
            error: {
              message: `invalid field`
            }
          })
        }

      EventsService.updateEvent(
         req.app.get('db'),
         req.params.event_id,
         eventToUpdate
      )
       .then(numRowsAffected => {
         res.status(204).end()
       })
       .catch(next)
    })


module.exports = eventsRouter
