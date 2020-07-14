const MenuService = {
    getAllMenuItems(knex){
        return knex.select('*').from('nomfinder_menu_items')
    },
    insertMenuItem(knex, newItem){
        return knex
        .insert(newItem)
        .into('nomfinder_menu_items')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    getMenuItemById(knex, id){
        return knex.from('nomfinder_menu_items').select('*').where('id', id).first()
    },
    deleteMenuItem(knex,id){
        return knex('nomfinder_menu_items')
        .where({id})
        .delete()
    },
    updateMenuItem(knex, id, newMenuItemFields){
        return knex('nomfinder_menu_items')
        .where({id})
        .update(newMenuItemFields)
    },
}

module.exports = MenuService
