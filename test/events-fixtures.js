function makeEventsArray(){
    return [
      {
        id: 1,
        event_name: 'Lunch @ The Ave',
        start_date: '2020-07-23T11:30:00.000Z',
        end_date: '2020-07-23T13:30:00.000Z',
        event_type: 'public',
        location_address: '5th Ave',
        location_city: 'Santa Clara',
        location_zipcode: 95050
      },
      {
        id: 2,
        event_name: 'Private Event',
        start_date: '2020-07-25T11:30:00.000Z',
        end_date: '2020-07-25T13:30:00.000Z',
        event_type: 'private',
        location_address: '123 Main St',
        location_city: 'San Jose',
        location_zipcode: 95132
      },
      {
        id: 3,
        event_name: 'Lunch @ Vista 99',
        start_date: '2020-07-29T11:30:00.000Z',
        end_date: '2020-07-29T13:30:00.000Z',
        event_type: 'public',
        location_address: '99 Vista Montaña',
        location_city: 'San Jose',
        location_zipcode: 95134
      },
      {
        id: 4,
        event_name: 'Private Event',
        start_date: '2020-07-29T17:00:00.000Z',
        end_date: '2020-07-29T18:30:00.000Z',
        event_type: 'private',
        location_address: '123 Main St',
        location_city: 'San Jose',
        location_zipcode: 95132
      }
    ];
}

function makeMaliciousEvent() {
  const maliciousEvent = {
    id: 911,
        event_name: 'xss entry <script>alert("xss");</script>',
        start_date: '2020-07-23T11:30:00.000Z',
        end_date: '2020-07-23T13:30:00.000Z',
        event_type: 'public',
        location_address: 'xss address <script>alert("xss");</script>',
        location_city: 'San Jose',
        location_zipcode: 95134
  }
  const expectedEvent = {
    ...maliciousEvent,
    event_name: 'xss entry &lt;script&gt;alert("xss");&lt;/script&gt;',
    location_address: 'xss address &lt;script&gt;alert("xss");&lt;/script&gt;',
  }
  return {
    maliciousEvent,
    expectedEvent,
  }
}

function makeFavoritesArray(){
    return [
      {
        id: 1,
	user_id: 1,
        event_id: 1,
      },
      {
        id: 2,
        user_id: 1,
        event_id: 4,
      },
      {
        id: 3,
        user_id: 1,
        event_id: 5,
      }
    ];
}


module.exports = {
    makeEventsArray,
    makeMaliciousEvent,
    makeFavoritesArray,
}
