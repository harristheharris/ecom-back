const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const { destroy } = require('../../models/Product');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [{model: Category}, {model: Tag, attributes: ['tag_name'], through: ProductTag, as: 'productTag_tagProduct'}]
    });

    if (!productData) {
      res.status(404).json({message: 'no product data aka nothing in the table buddy ol pal'})
    }

      res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }


});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data

  try {
    const productData = await Product.findByPk(req.params.id, {
      include: 
      [{ model: Category}, { model: Tag, attributes: ['tag_name'], through: ProductTag, as: 'productTag_tagProduct'}]
      
    });

    if (!productData) {
      res.status(404).json({ message: 'No location found with this id'});
      return;
    }

    res.status(200).json(productData)
    
  } catch (err) {
    res.status(500).json(err);
  }

});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */

    
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {


  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  //lets try to delete
  try {
    //lets delete a product
    const productData = await Product.destroy({
      //this specifies the product we are going to delete
      where: {
        id: req.params.id
      }
    });
    //if the product does not exist
    if (!productData) {
      //give the user a 404 error code
      res.status(404).json({message: 'this product id does not exist my dood'})
    }
    //if it does work, we are golden
    res.status(200).json(productData)

    //if there are other problems
  } catch {
    //give the user a 500 error code
    res.status(500).json(err)
  }
});

module.exports = router;
