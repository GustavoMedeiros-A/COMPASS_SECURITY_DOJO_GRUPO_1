const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserById, updateUsername } = require('../../service/service');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')


router.use(cookieParser());
const renderData = {};

var csrf = require('csurf')
var csrfProtect = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({extended: false})

router.get(
	'/csrf-post',
	csrfProtect, async (req, res) => {
		const { token } = req.cookies;
		const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
	
				console.log(err.name, err.message);
	
				return false;
	
			} else return decoded.user_id;
	
		});

		if (typeof decode === 'undefined') {
			res.render('user-not-authenticated');
		} else {
			const { rows } = await getUserById(decode);
			renderData.username = rows[0].username;
			renderData.token = req.csrfToken();
			res.render('csrf-post', renderData);
		}
	}
);

router.post(
	'/csrf-post/alterarusername',
	csrfProtect, parseForm, async (req, res) => {
		//CRIA A VARIAVEI COM BASE NO QUE VEIO NA URL
		const { novo_username } = req.body;
		//CRIA A VARIAVEL COM BASE NO QUE ESTA NOS COOKIES
		const { token } = req.cookies;
		const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
	
				console.log(err.name, err.message);
	
				return false;
	
			} else return decoded.user_id;
	
		});
		const { rows } = await getUserById(decode);
		const userExiste = rows.length == 1;
		if (userExiste) {
			const { rows } = await updateUsername(novo_username, decode);
			renderData.username = rows[0].username;
			
			res.render('csrf-post', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('csrf-post', renderData);
		}
	}
);

module.exports = router;
