const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeMenuItemsArray, makeMaliciousItem } = require('./menu-items-fixtures')


describe('Menu Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('nomfinder_menu_items').truncate())
  afterEach(() => db('nomfinder_menu_items').truncate())

  describe(`GET /menu`, () => {
    context(`Given no menu items`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/menu')
          .expect(200, [])
      })
    })

    context('Given there are menu items in the database', () => {
	const testMenuItems = makeMenuItemsArray()

      beforeEach('insert menu items', () => {
        return db
          .into('nomfinder_menu_items')
          .insert(testMenuItems)
      })

      it('responds with 200 and all of the menu items', () => {
        return supertest(app)
          .get('/menu')
          .expect(200, testMenuItems)
      })
    })

    context(`Given an XSS attack item`, () => {
      const { maliciousItem, expectedItem } = makeMaliciousItem()
      const testMenuItems = makeMenuItemsArray()

      beforeEach('insert malicious item', () => {
        return db
              .into('nomfinder_menu_items')
              .insert([ maliciousItem ])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/menu`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].item_name).to.eql(expectedItem.item_name)
            expect(res.body[0].item_description).to.eql(expectedItem.item_description)
          })
      })
    })

  })


  describe(`POST /menu`, () => {
    it(`creates an menu item, responding with 201 and the new menu item`, () => {
      this.retries(3)
      const newItem = {
          item_name: 'new menu item name',
          item_description: 'new description',
          ingredients: 'new ingredients test',
          vegetarian: false,
          vegan: false,
          vegetarian_option: false,
          vegan_option: false,
          gluten_free: false,
          cost: '9.00',
          menu_category: 1
      }
      return supertest(app)
        .post('/menu')
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body.item_name).to.eql(newItem.item_name)
          expect(res.body.item_description).to.eql(newItem.item_description)
          expect(res.body.ingredients).to.eql(newItem.ingredients)
          expect(res.body.vegetarian).to.eql(newItem.vegetarian)
          expect(res.body.vegan).to.eql(newItem.vegan)
          expect(res.body.vegetarian_option).to.eql(newItem.vegetarian_option)
          expect(res.body.vegan_option).to.eql(newItem.vegan_option)
          expect(res.body.gluten_free).to.eql(newItem.gluten_free)
          expect(res.body.cost).to.eql(newItem.cost)
          expect(res.body.menu_category).to.eql(newItem.menu_category)
        })
        .then(res =>
          supertest(app)
            .get(`/menu/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['item_name', 'item_description', 'ingredients', 'vegetarian', 'vegan', 'vegetarian_option', 'vegan_option', 'gluten_free','cost','menu_category']

    requiredFields.forEach(field => {
      const newItem = {
        item_name: 'Test new item',
	item_description: 'test description',
	ingredients: 'test',
          vegetarian: false,
          vegan: false,
          vegetarian_option: false,
          vegan_option: false,
          gluten_free: false,
          cost: '9.00',
          menu_category: 1
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newItem[field]

        return supertest(app)
          .post('/menu')
          .send(newItem)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousItem, expectedItem } = makeMaliciousItem()
      return supertest(app)
        .post(`/menu`)
        .send(maliciousItem)
        .expect(201)
        .expect(res => {
          expect(res.body.item_name).to.eql(expectedItem.item_name)
          expect(res.body.item_description).to.eql(expectedItem.item_description)
        })
    })

  })


  describe(`DELETE /menu/:item_id`, () => {
    context(`Given no items`, () => {
      it(`responds with 404`, () => {
        const itemId = 123456
        return supertest(app)
          .delete(`/menu/${itemId}`)
          .expect(404, { error: { message: `Menu item doesn't exist` } })
      })
    })

    context('Given there are items in the database', () => {
      const testMenuItems = makeMenuItemsArray()

      beforeEach('insert items', () => {
        return db
          .into('nomfinder_menu_items')
          .insert(testMenuItems)
      })

      it('responds with 204 and removes the item', () => {
        const idToRemove = 2
        const expectedItems = testMenuItems.filter(item => item.id !== idToRemove)
        return supertest(app)
          .delete(`/menu/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/menu`)
              .expect(expectedItems)
          )
      })
    })
  })

  describe(`GET /menu/:menu_item_id`, () => {
    context(`Given no menu item`, () => {
      it(`responds with 404`, () => {
        const itemId = 123456
        return supertest(app)
          .get(`/menu/${itemId}`)
          .expect(404, { error: { message: `Menu item doesn't exist` } })
      })
    })

    context('Given there are menu items in the database', () => {
	const testMenuItems = makeMenuItemsArray()

      beforeEach('insert menu items', () => {
        return db
          .into('nomfinder_menu_items')
          .insert(testMenuItems)
      })

      it('responds with 200 and the specified item', () => {
        const itemId = 2
        const expectedItem = testMenuItems[itemId - 1]
        return supertest(app)
          .get(`/menu/${itemId}`)
          .expect(200, expectedItem)
      })
    })
  })

  describe(`PATCH /menu/:item_id`, () => {
    context(`Given no items`, () => {
      it(`responds with 404`, () => {
        const itemId = 123456
        return supertest(app)
          .delete(`/menu/${itemId}`)
          .expect(404, { error: { message: `Menu item doesn't exist` } })
      })
    })

    context('Given there are items in the database', () => {
      const testMenuItems = makeMenuItemsArray()

      beforeEach('insert items', () => {
        return db
          .into('nomfinder_menu_items')
          .insert(testMenuItems)
      })

      it('responds with 204 and updates the item', () => {
        const idToUpdate = 2
        const updateItem = {
          item_name: 'updated menu item name',
          item_description: 'updated description',
          ingredients: 'updated ingredients test',
          vegetarian: false,
          vegan: false,
          vegetarian_option: false,
          vegan_option: false,
          gluten_free: true,
          cost: '9.00',
          menu_category: 1
        }
        const expectedItem = {
          ...testMenuItems[idToUpdate - 1],
          ...updateItem
        }
        return supertest(app)
          .patch(`/menu/${idToUpdate}`)
          .send(updateItem)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/menu/${idToUpdate}`)
              .expect(expectedItem)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/menu/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `invalid field`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateItem = {
          item_name: 'updated item title',
        }
        const expectedItem = {
          ...testMenuItems[idToUpdate - 1],
          ...updateItem
        }

        return supertest(app)
          .patch(`/menu/${idToUpdate}`)
          .send({
            ...updateItem,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/menu/${idToUpdate}`)
              .expect(expectedItem)
          )
      })
    })
  })
})
