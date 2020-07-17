const MenuService = {
    getAllMenuItems(knex){
        return knex.select('*').from('nomfinder_menu_items')
    },
    _getAllMenuItems(knex){
        return knex('nomfinder_menu_items').join('nomfinder_menu_category', 'nomfinder_menu_items.menu_category', '=', 'nomfinder_menu_category.id').select('nomfinder_menu_items.id','nomfinder_menu_items.item_name','nomfinder_menu_items.item_description','nomfinder_menu_items.ingredients','nomfinder_menu_items.vegetarian','nomfinder_menu_items.vegan','nomfinder_menu_items.vegetarian_option','nomfinder_menu_items.vegan_option','nomfinder_menu_items.gluten_free','nomfinder_menu_items.cost','nomfinder_menu_items.menu_category','nomfinder_menu_category.category_name')
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
