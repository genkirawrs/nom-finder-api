function makeMenuItemsArray(){
    return [
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
    ];
}

function makeMaliciousItem() {
  const maliciousItem = {
    id: 911,
        item_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        item_description: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
        ingredients: '',
        vegetarian: false,
        vegan: false,
        vegetarian_option: false,
        vegan_option: false,
        gluten_free: false,
        cost: '5.00',
        menu_category: 3
  }
  const expectedItem = {
    ...maliciousItem,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousItem,
    expectedItem,
  }
}

module.exports = {
    makeMenuItemsArray,
    makeMaliciousItem,
}
