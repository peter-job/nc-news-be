const router = require('express').Router();
const { getArticles } = require('../controllers/articles');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getArticles)
  .all(handle405);
