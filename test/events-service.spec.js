const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeEventsArray, makeMaliciousEvent,makeFavoritesArray } = require('./events-fixtures')

describe(`events service object`, function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db('nomfinder_events').truncate())
  afterEach(() => db('nomfinder_events').truncate())

  describe(`GET /api/calendar`, () => {
    context(`Given no events`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/calendar')
          .expect(200, [])
      })
    })

    context('Given there are events in the database', () => {
        const testEvents = makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_events')
          .insert(testEvents)
      })

      it('responds with 200 and all of the events', () => {
        return supertest(app)
          .get('/api/calendar')
          .expect(200, testEvents)
      })
    })

    context(`Given an XSS attack event`, () => {
      const { maliciousEvent, expectedEvent } = makeMaliciousEvent()
      const testEvents = makeEventsArray()

      beforeEach('insert malicious event', () => {
        return db
              .into('nomfinder_events')
              .insert([ maliciousEvent ])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/calendar`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].event_name).to.eql(expectedEvent.event_name)
            expect(res.body[0].location_address).to.eql(expectedEvent.location_address)
          })
      })
    })

  })

  describe(`POST /api/calendar`, () => {
    it(`creates an event, responding with 201 and the new event`, () => {
      this.retries(3) 
      const newEvent = {
          event_name: 'new event name',
          start_date: '2020-07-23T17:00:00.000Z',
          end_date: '2020-07-23T18:30:00.000Z',
          event_type: 'private',
          location_address: '5 First St',
          location_city: 'Santa Clara',
          location_zipcode: 95054,
      }
      return supertest(app)
        .post('/api/calendar')
        .send(newEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.event_name).to.eql(newEvent.event_name)
          expect(res.body.start_date).to.eql(newEvent.start_date)
          expect(res.body.end_date).to.eql(newEvent.end_date)
          expect(res.body.event_type).to.eql(newEvent.event_type)
          expect(res.body.location_address).to.eql(newEvent.location_address)
          expect(res.body.location_city).to.eql(newEvent.location_city)
          expect(res.body.location_zipcode).to.eql(newEvent.location_zipcode)
          expect(res.headers.location).to.eql(`/api/calendar/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/calendar/${res.body.id}`)
            .expect(res.body)
        )
    })
    const requiredFields = ['event_name', 'start_date', 'end_date', 'event_type', 'location_address', 'location_city', 'location_zipcode']

    requiredFields.forEach(field => {
      const newEvent = {
        event_name: 'Test event',
        start_date: '2020-07-23T17:00:00.000Z',
        end_date: '2020-07-23T18:30:00.000Z',
        event_type: 'public',
        location_address: '5 First St',
        location_city: 'Santa Clara',
        location_zipcode: 95054,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEvent[field]

        return supertest(app)
          .post('/api/calendar')
          .send(newEvent)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousEvent, expectedEvent } = makeMaliciousEvent()
      return supertest(app)
        .post(`/api/calendar`)
        .send(maliciousEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.event_name).to.eql(expectedEvent.event_name)
          expect(res.body.location_address).to.eql(expectedEvent.location_address)
        })
    })

  })

  describe(`DELETE /api/calendar/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .delete(`/api/calendar/${eventId}`)
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = makeEventsArray() 

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_events')
          .insert(testEvents)
      })

      it('responds with 204 and removes the event', () => {
        const idToRemove = 2
        const expectedEvents = testEvents.filter(event => event.id !== idToRemove)
        return supertest(app)
          .delete(`/api/calendar/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/calendar`)
              .expect(expectedEvents)
          )
      })
    })
  })

  describe(`GET /api/calendar/:event_id`, () => {
    context(`Given no event`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .get(`/api/calendar/${eventId}`)
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

    context('Given there are events in the database', () => {
	const testEvents = makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_events')
          .insert(testEvents)
      })

      it('responds with 200 and the specified event', () => {
        const eventId = 2
        const expectedEvent = testEvents[eventId - 1]
        return supertest(app)
          .get(`/api/calendar/${eventId}`)
          .expect(200, expectedEvent)
      })
    })
  })
  describe(`PATCH /api/calendar/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .delete(`/api/calendar/${eventId}`)
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = makeEventsArray()

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_events')
          .insert(testEvents)
      })

      it('responds with 204 and updates the event', () => {
        const idToUpdate = 2
        const updateEvent = {
          event_name: 'Updated Event test',
          start_date: '2020-07-29T17:00:00.000Z',
          end_date: '2020-07-29T18:30:00.000Z',
          event_type: 'private',
          location_address: '5 First St',
          location_city: 'Santa Clara',
          location_zipcode: 95054
        }
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updateEvent
        }
        return supertest(app)
          .patch(`/api/calendar/${idToUpdate}`)
          .send(updateEvent)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/calendar/${idToUpdate}`)
              .expect(expectedEvent)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/calendar/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `invalid field`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateEvent = {
          event_name: 'updated event title',
        }
        const expectedEvent = {
          ...testEvents[idToUpdate - 1],
          ...updateEvent
        }

        return supertest(app)
          .patch(`/api/calendar/${idToUpdate}`)
          .send({
            ...updateEvent,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/calendar/${idToUpdate}`)
              .expect(expectedEvent)
          )
      })
    })
  })

})


describe(`favorite events service object`, function() {
  let db
    
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })
  
  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db('nomfinder_favorite_events').truncate())
  afterEach(() => db('nomfinder_favorite_events').truncate())

  describe(`GET /api/calendar/fav/:user_id/:event_id`, () => {
    context(`Given no event`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .get(`/api/calendar/fav/1/${eventId}`)
	  .expect(200, [])
      })
    })

    context('Given there are events in the database', () => {
        const testEvents = makeFavoritesArray()

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_favorite_events')
          .insert(testEvents)
      })

      it('responds with 200 and the specified event', () => {
        const eventId = 2
        return supertest(app)
          .get(`/api/calendar/fav/1/${eventId}`)
          .expect(200, testEvents)
      })
    })
  })

  describe(`DELETE /api/calendar/fav/:user_id/:event_id`, () => {
    context(`Given no events`, () => {
      it(`responds with 404`, () => {
        const eventId = 123456
        return supertest(app)
          .delete(`/api/calendar/fav/1/${eventId}`)
          .expect(204)
      })
    })

    context('Given there are events in the database', () => {
      const testEvents = makeFavoritesArray()

      beforeEach('insert events', () => {
        return db
          .into('nomfinder_favorite_events')
          .insert(testEvents)
      })

      it('responds with 204 and removes the event', () => {
        const idToRemove = 2
        const expectedEvents = testEvents.filter(event => event.id !== idToRemove)
        return supertest(app)
          .delete(`/api/calendar/fav/1/${idToRemove}`)
          .expect(204)
      })
    })
  })

  describe(`POST /api/calendar/fav`, () => {
    it(`creates a fav event, responding with 201 and the new event`, () => {
      this.retries(3)
      const newEvent = {
	user_id: 1,
	event_id: 4,
      }
	const eventId = 4
      return supertest(app)
        .post('/api/calendar/fav/1/$(eventId}')
        .send(newEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.event_id).to.eql(newEvent.event_id)
          expect(res.body.user_id).to.eql(newEvent.user_id)
        })
    })
    const requiredFields = ['user_id','event_id']

    requiredFields.forEach(field => {
      const newEvent = {
	event_id: 5,
	user_id: 1
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEvent[field]

        return supertest(app)
          .post('/api/calendar/fav/${user_id}/${event_id}')
          .send(newEvent)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

  })

})
