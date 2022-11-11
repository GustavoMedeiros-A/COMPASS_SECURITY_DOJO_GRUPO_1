const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { updateUsername, getUserById } = require('../../service/service');
const jwt = require('jsonwebtoken')
router.use(cookieParser());

const renderData = {};


router.get(
	'/broken_autentication',
	errHandling(async (req, res) => {
		const { token } = req.cookies;

		const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if(err) {
				console.log(err.name, err.message)
				return false;
			} else return decoded.user_id
		})

		if (typeof decode === 'undefined') {
			res.render('user-not-authenticated');
		} else {
			const { rows } = await getUserById(decode);
			renderData.username = rows[0].username;
			renderData.user_id = decode;
			res.render('broken_autentication', renderData);
		}
	})
);

router.post(
	'/broken_autentication/alterarusername',
	errHandling(async (req, res) => {
		//CRIA A VARIAVEI COM BASE NO QUE VEIO NA URL
		const { id: user_id, novo_username } = req.body;
		renderData.user_id = user_id;
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
			res.render('broken_autentication', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('broken_autentication', renderData);
		}
	})
);

module.exports = router;
