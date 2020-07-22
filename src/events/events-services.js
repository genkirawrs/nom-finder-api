const EventsService = {
    getAllUpcomingEvents(knex){
	return knex.from('nomfinder_events').select('*').where('start_date','>=',new Date())
    },
    insertEvent(knex, newEvent){
	return knex
	.insert(newEvent)
	.into('nomfinder_events')
	.returning('*')
	.then(rows => {
	    return rows[0]
	})
    },
    getEventById(knex, id){
	return knex.from('nomfinder_events').select('*').where('id', id).first()
    },
    deleteEvent(knex,id){
	return knex('nomfinder_events')
	.where({id})
	.delete()
    },
    updateEvent(knex, id, newEventFields){
	return knex('nomfinder_events')
	.where({id})
	.update(newEventFields)
    },
    insertFavoriteEvent(knex, newFav){
	return knex
        .insert(newFav)
        .into('nomfinder_favorite_events')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    deleteFavoriteEvent(knex,id){
        return knex('nomfinder_favorite_events')
        .where({id})
        .delete()
    },
    getFavoriteEvents(knex, user_id){
        return knex.from('nomfinder_favorite_events').select('*').where('user_id', user_id)
    },
}

module.exports = EventsService
