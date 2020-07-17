const express = require('express')
const path = require('path')
const xss = require('xss')
const MenuService = require('./menu-services')

const menuRouter = express.Router()
const jsonParser = express.json()

menuRouter
    .route('/')
    .get((req, res, next) => {
      MenuService.getAllMenuItems(
	req.app.get('db')
      )
      .then(items=> {
          res.json(items)
      })
      .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
      const { item_name, item_description, ingredients, vegetarian, vegan, vegetarian_option, vegan_option, gluten_free, cost, menu_category } = req.body
      const newItem = { item_name, item_description, ingredients, vegetarian, vegan, vegetarian_option, vegan_option, gluten_free, cost, menu_category }
      for (const [key, value] of Object.entries(newItem)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }
      MenuService.insertMenuItem(
        req.app.get('db'),
        newItem
      )
       .then(item => {
         res
           .status(201)
           .location(path.posix.join(req.originalUrl, `/menu/${item.id}`))
           .json(item)
       })
       .catch(next)
    })

menuRouter
    .route('/:item_id')
    .all((req, res, next) => {
      MenuService.getMenuItemById(
        req.app.get('db'),
        req.params.item_id
      )
        .then(item => {
          if (!item) {
            return res.status(404).json({
              error: { message: `Menu item doesn't exist` }
            })
          }
          res.item = item
          next() 
        })
        .catch(next)
    })
    .get((req, res, next) => {
      res.json({
            id: res.item.id,
	    item_name: xss(res.item.item_name),
            item_description: xss(res.item.item_description),
            ingredients: xss(res.item.ingredients),
            vegetarian: res.item.vegetarian,
            vegan: res.item.vegan,
            vegetarian_option: res.item.vegetarian_option,
            vegan_option: res.item.vegan_option,
            gluten_free: res.item.gluten_free,
            cost: res.item.cost,
            menu_category: res.item.menu_category,
      })
    })
    .delete((req, res, next) => {
      MenuService.deleteMenuItem(
        req.app.get('db'),
        req.params.item_id
      )
        .then(() => {
          res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
      const { item_name, item_description, ingredients, vegetarian, vegan, vegetarian_option, vegan_option, gluten_free, cost, menu_category } = req.body
      const itemToUpdate = { item_name, item_description, ingredients, vegetarian, vegan, vegetarian_option, vegan_option, gluten_free, cost, menu_category }

      const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          return res.status(400).json({
            error: {
              message: `invalid field`
            }
          })
        }

      MenuService.updateMenuItem(
         req.app.get('db'),
         req.params.item_id,
         itemToUpdate
      )
       .then(numRowsAffected => {
         res.status(204).end()
       })
       .catch(next)
    })

module.exports = menuRouter
