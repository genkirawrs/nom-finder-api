const EventsService = require('../src/events/events-services')
const knex = require('knex')


describe(`events service object`, function() {
    let db

    let testEvents = [
      {
	id: 1,
	event_name: 'Lunch @ The Ave',
	start_date: new Date('2020-07-17 11:30:00'),
	end_date: new Date('2020-07-17 13:30:00'),
	event_type: 'public',
	location_address: '5th Ave',
	location_city: 'Santa Clara',
	location_zipcode: 95050
      },
      {
        id: 2,
        event_name: 'Private Event',
        start_date: new Date('2020-07-18 11:30:00'),
        end_date: new Date('2020-07-18 13:30:00'),
        event_type: 'private',
        location_address: '123 Main St',
        location_city: 'San Jose',
        location_zipcode: 95132
      },
      {
        id: 3,
        event_name: 'Lunch @ Vista 99',
        start_date: new Date('2020-07-23 11:30:00'),
        end_date: new Date('2020-07-23 13:30:00'),
        event_type: 'public',
        location_address: '99 Vista Montaña',
        location_city: 'San Jose',
        location_zipcode: 95134
      },
      {
        id: 4,
        event_name: 'Private Event',
        start_date: new Date('2020-07-23 17:00:00'),
        end_date: new Date('2020-07-23 18:30:00'),
        event_type: 'private',
        location_address: '123 Main St',
        location_city: 'San Jose',
        location_zipcode: 95132
      }
    ]

    before(() => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
    })

    before(() => db('nomfinder_events').truncate())
    afterEach(() => db('nomfinder_events').truncate())
    after(() => db.destroy())


    context(`Given 'nomfinder_events' has data`, () => {
      beforeEach(() => {
        return db
          .into('nomfinder_events')
          .insert(testEvents)
      })

      it(`getAllUpcomingEvents resolves all upcoming events from 'nomfinder_events' table`, () => {
        return EventsService.getAllUpcomingEvents(db)
          .then(actual => {
            expect(actual).to.eql(testEvents)
          })
      })

      it(`getEventById() resolves an event by id from 'nomfinder_events' table`, () => {
	const thirdId = 3
	const thirdTestEvent = testEvents[thirdId - 1]
	return EventsService.getEventById(db, thirdId)
	  .then(actual => {
	    expect(actual).to.eql({
		id: thirdId,
		event_name: thirdTestEvent.event_name,
		start_date: thirdTestEvent.start_date,
		end_date: thirdTestEvent.end_date,
		event_type: thirdTestEvent.event_type,
		location_address: thirdTestEvent.location_address,
		location_city: thirdTestEvent.location_city,
		location_zipcode: thirdTestEvent.location_zipcode,
	    })
	  })
      })

      it(`deleteEvent() removes an event by id from 'nomfinder_events' table`, () => {
        const eventId = 3
        return EventsService.deleteEvent(db, eventId)
          .then(() => EventsService.getAllUpcomingEvents(db))
          .then(allEvents => {
             const expected = testEvents.filter(event => event.id !== eventId)
             expect(allEvents).to.eql(expected)
          })
      })

      it(`updateEvent() updates an event from the 'nomfinder_events' table`, () => {
	const idOfEventToUpdate = 3
	const newEventData = {
          event_name: 'Updated Event test',
          start_date: new Date('2020-07-23 17:00:00'),
          end_date: new Date('2020-07-23 18:30:00'),
          event_type: 'private', 
          location_address: '5 First St',
          location_city: 'Santa Clara',
          location_zipcode: 95054
	}
	return EventsService.updateEvent(db, idOfEventToUpdate, newEventData)
	  .then(() => EventsService.getEventById(db, idOfEventToUpdate))
	  .then(event => {
	     expect(event).to.eql({
		id: idOfEventToUpdate,
		...newEventData,
	     })
	  })
      })

    })

    context(`Given 'nomfinder_events' has no data`, () => {

      it(`getAllUpcomingEvents() resolves an empty array`, () => {
        return EventsService.getAllUpcomingEvents(db)
          .then(actual => {
            expect(actual).to.eql([])
        })
      })

      it(`insertEvent() inserts an event and resolves the event with an 'id'`, () => {
	const newEvent = {
          event_name: 'Lunch @ River Terrace',
          start_date: new Date('2020-07-25 11:30:00'),
          end_date: new Date('2020-07-25 13:30:00'),
          event_type: 'public',
          location_address: '730 Agnew Rd',
          location_city: 'Santa Clara',
          location_zipcode: 95054
	}
	return EventsService.insertEvent(db, newEvent)
	  .then(actual => {
	    expect(actual).to.eql({
	        id: 1,
		event_name: newEvent.event_name,
		start_date: new Date(newEvent.start_date),
	        end_date: new Date(newEvent.end_date),
        	event_type: newEvent.event_type,
	        location_address: newEvent.location_address,
        	location_city: newEvent.location_city,
	        location_zipcode: newEvent.location_zipcode
            })
          })
      })

    })

})
