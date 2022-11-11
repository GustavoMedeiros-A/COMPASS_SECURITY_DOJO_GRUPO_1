const router = require('express').Router();
const { errHandling, verifyJWT } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserById, updateUsername } = require('../../service/service');
const jwt = require('jsonwebtoken')
router.use(cookieParser());

const renderData = {};

router.get(
	'/cookie_manipulation',
	errHandling(async (req, res) => {
		const { token } = req.cookies;

		const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
	
				console.log(err.name, err.message);
	
				return false;
	
			} else return decoded.user_id;
	
		});

		const autenticado = decode === false;
		console.log(autenticado)
		if (autenticado) {
			res.render('user-not-authenticated');
		} else {
			const { rows } = await getUserById(decode);
			renderData.username = rows[0].username;
			res.render('cookie_manipulation', renderData);
		}
	})
);

router.get(
	'/cookie_manipulation/alterarusername',
	errHandling(async (req, res) => {
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
			res.render('cookie_manipulation', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('cookie_manipulation', renderData);
		}
	})
);

module.exports = router;
