const router = require('express').Router();
const { errHandling, request } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { render } = require('ejs');
const { updateUsername, getUserById } = require('../../service/service');
const jwt = require('jsonwebtoken')
const { check } = require('express-validator');

router.use(cookieParser());

const renderData = {};

router.get(
	'/xss_armazenado',
	errHandling(async (req, res) => {
		const { token } = req.cookies
		const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
	
				console.log(err.name, err.message);
	
				return false;
	
			} else return decoded.user_id;
	
		});

		const usuario = decode == false;
		if (usuario) {
			res.render('user-not-authenticated');
		} else {
			const { rows } = await getUserById(decode);
			renderData.username = rows[0].username;
			res.render('xss_armazenado', renderData);
		}
	})
);

router.get(
	'/xss_armazenado/alterarusername',
	[check('novo_username').escape()], async (req, res) => {
		//CRIA A VARIAVEI COM BASE NO QUE VEIO NA URL
		const { novo_username } = req.query;
		//CRIA A VARIAVEI COM BASE NO QUE ESTA NOS COOKIES
		const { token } = req.cookies;
		const decode = jwt.verify(
			token,
			process.env.TOKEN_SECRET,
			(err, decoded) => {
			  if (err) {
			  console.log(err.name, err.message);
			  return false;
			  } else return decoded.user_id;
			}
		  );
		//BUSCA NO BANCO DE DADOS SE O USUARIO EXISTE
		const { rows } = await getUserById(decode);
		const userExiste = rows.length == 1;
		if (userExiste) {
			const { rows } = await updateUsername(novo_username, decode);
			renderData.username = rows[0].username;
			res.render('xss_armazenado', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('xss_armazenado', renderData);
		}
	}
);

module.exports = router;
