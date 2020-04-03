var express = require('express');
var router = express.Router();
const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer({
	template: require('fs').readFileSync('./views/index.template.html', 'utf-8')
})

/* GET home page. */
router.get('/ssr', function(req, res, next) {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })


  renderer.renderToString(app, (err, html) => {
	console.log(html) // html 将是注入应用程序内容的完整页面
	if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(html)
  })

  // res.render('index', { title: 'Express' });
});

module.exports = router;
