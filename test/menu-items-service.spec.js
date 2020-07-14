const MenuItemService = require('../src/menu/menu-services')
const knex = require('knex')


describe(`menu service object`, function() {
    let db

    let testMenuItems = [
      {
	id: 1,
	item_name: 'PBLT',
	item_description: 'Our take on the classic BLT',
	ingredients: 'Crispy and thick center cut bacon, oven braised pulled pork, creamy avocado, power greens, fresh tomatoes, and topped with tangy mayo drizzle',
	vegetarian: false,
	vegan: false,
	vegetarian_option: false,
	vegan_option: false,
	gluten_free: false,
	cost: '11.00',
	menu_category: 2
      },
      {
        id: 2,
        item_name: 'Aloo Sabji / Passage to India',
        item_description: 'A great vegetarian option that won’t leave you asking for more!',
        ingredients: 'Authentic Indian stir-fried potatoes, onions, tomatoes, garlic and ginger, garnished with cilantro, and topped with a cooling yogurt-cilantro chutney',
        vegetarian: true,
        vegan: false,
        vegetarian_option: false,
        vegan_option: false,
        gluten_free: false,
        cost: '9.50',
        menu_category: 2
      },
      {
        id: 3,
        item_name: 'Going Bananas',
        item_description: 'The classic dessert crepe',
        ingredients: 'Sliced fresh bananas on a Nutella spread, topped with whipped cream',
        vegetarian: false,
        vegan: false,
        vegetarian_option: false,
        vegan_option: false,
        gluten_free: false,
        cost: '8.50',
        menu_category: 1
      },
      {
        id: 4,
        item_name: 'Chicken Tenders',
        item_description: 'A basket of 3 crispy golden tender',
        ingredients: '',
        vegetarian: false,
        vegan: false,
        vegetarian_option: false,
        vegan_option: false,
        gluten_free: false,
        cost: '5.00',
        menu_category: 3
      }
    ]

    before(() => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
    })

    before(() => db('nomfinder_menu_items').truncate())
    afterEach(() => db('nomfinder_menu_items').truncate())
    after(() => db.destroy())


    context(`Given 'nomfinder_menu_items' has data`, () => {
      beforeEach(() => {
        return db
          .into('nomfinder_menu_items')
          .insert(testMenuItems)
      })

      it(`getAllMenuItems resolves all menu items from 'nomfinder_menu_items' table`, () => {
        return MenuItemService.getAllMenuItems(db)
          .then(actual => {
            expect(actual).to.eql(testMenuItems)
          })
      })

      it(`getMenuItemById() resolves a meny item by id from 'nomfinder_menu_items' table`, () => {
	const thirdId = 3
	const thirdTestItem = testMenuItems[thirdId - 1]
	return MenuItemService.getMenuItemById(db, thirdId)
	  .then(actual => {
	    expect(actual).to.eql({
		id: thirdId,
		item_name: thirdTestItem.item_name,
		item_description: thirdTestItem.item_description,
		ingredients: thirdTestItem.ingredients,
		vegetarian: thirdTestItem.vegetarian,
		vegan: thirdTestItem.vegan,
		vegetarian_option: thirdTestItem.vegetarian_option,
		vegan_option: thirdTestItem.vegan_option,
		gluten_free: thirdTestItem.gluten_free,
		cost: thirdTestItem.cost,
		menu_category: thirdTestItem.menu_category
	    })
	  })
      })

      it(`deleteMenuItem() removes a menu item by id from 'nomfinder_menu_items' table`, () => {
        const menuItemId = 3
        return MenuItemService.deleteMenuItem(db, menuItemId)
          .then(() => MenuItemService.getAllMenuItems(db))
          .then(allItems => {
             const expected = testMenuItems.filter(item => item.id !== menuItemId)
             expect(allItems).to.eql(expected)
          })
      })

      it(`updateMenuItem() updates a menu item from the 'nomfinder_menu_items' table`, () => {
	const idOfItemToUpdate = 3
	const newItemData = {
          item_name: 'Updated menu item name',
          item_description: 'updated description',
          ingredients: 'updated ingredients test',
          vegetarian: false,
          vegan: false,
          vegetarian_option: false,
          vegan_option: false,
          gluten_free: false,
          cost: '9.00',
          menu_category: 1
	}
	return MenuItemService.updateMenuItem(db, idOfItemToUpdate, newItemData)
	  .then(() => MenuItemService.getMenuItemById(db, idOfItemToUpdate))
	  .then(item => {
	     expect(item).to.eql({
		id: idOfItemToUpdate,
		...newItemData,
	     })
	  })
      })

    })

    context(`Given 'nomfinder_menu_items' has no data`, () => {

      it(`getAllMenuItems() resolves an empty array`, () => {
        return MenuItemService.getAllMenuItems(db)
          .then(actual => {
            expect(actual).to.eql([])
        })
      })

      it(`insertMenuItem() inserts a menu item and resolves the item with an 'id'`, () => {
	const newItem = {
          item_name: 'new menu item name',
          item_description: 'new description',
          ingredients: 'new ingredients test',
          vegetarian: false,
          vegan: false,
          vegetarian_option: false,
          vegan_option: false,
          gluten_free: false,
          cost: '7.00',
          menu_category: 1
	}
	return MenuItemService.insertMenuItem(db, newItem)
	  .then(actual => {
	    expect(actual).to.eql({
	        id: 1,
                item_name: newItem.item_name,
                item_description: newItem.item_description,
                ingredients: newItem.ingredients,
                vegetarian: newItem.vegetarian,
                vegan: newItem.vegan,
                vegetarian_option: newItem.vegetarian_option,
                vegan_option: newItem.vegan_option,
                gluten_free: newItem.gluten_free,
                cost: newItem.cost,
                menu_category: newItem.menu_category
            })
          })
      })

    })

})
