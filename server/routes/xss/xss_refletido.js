const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserByName } = require('../../service/service');
const { check } = require('express-validator');


router.use(cookieParser());

const renderData = {};

router.get(
	'/xss_refletido',
	[check('nome').escape()], async (req, res) => {
		const { nome } = req.query;
		renderData.hasUsers = 'false';
		renderData.busca = nome;
		if (nome != undefined && nome.length > 1) {
			const { rows } = await getUserByName(nome);

			if (rows[0]) renderData.hasUsers = 'true';
			renderData.busca = nome;
			renderData.users = rows;
		}

		res.render('xss_refletido', renderData);
	}
);

module.exports = router;
