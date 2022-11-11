const router = require('express').Router();
const { errHandling, verifyJWT } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getNotasByUserId } = require('../../service/service');
const jwt = require('jsonwebtoken')
// const  promisify  = require('util')

router.use(cookieParser());

const renderData = {};

router.get(
	'/idor',
	errHandling(async (req, res) => {
		const { token } = req.cookies;

    	const decode = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
	
				console.log(err.name, err.message);
	
				return false;
	
			} else return decoded.user_id;
	
		});

		const usuario = decode == false;
		if (usuario) {
			res.redirect('/user-not-authenticated');
		} else {
			res.redirect(`idor/notas/`);
		}
	})
);

router.get(
	'/idor/notas',
	errHandling(async (req, res) => {
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
		if (!isNaN(parseInt(decode))) {
			const { rows } = await getNotasByUserId(decode);

			renderData.posts = rows;
			res.render('idor', renderData);
		} else {
			res.redirect('/user-not-authenticated');
		}
	})
);

module.exports = router;
