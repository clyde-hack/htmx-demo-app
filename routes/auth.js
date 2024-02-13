import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const auth = express.Router();

auth
	.route('/login')
	.get((req, res) => {
		res.render('login');
	})
	.post(async (req, res) => {
		const { email, password } = req.body;

		if (!email && !password) {
			return res.render('/login', { error: 'You must provide a email and password!' });
		}

		if (!email) {
			return res.render('/login', { error: 'You must provide a email!' });
		}

		if (!password) {
			return res.render('/login', { error: 'You must provide a password!' });
		}

		const sql = 'SELECT * FROM Users WHERE email = ?';
		const values = [email];

		try {
			const [result, fields] = await db.execute(sql, values);

			if (!result.length) {
				throw new Error('No user mathing that email!');
			} else {
				const match = await bcrypt.compare(password, result[0].password);

				if (!match) {
					throw new Error('Password is incorrect!');
				}

				const user = { ...result[0] };
				delete user.password;
				req.session.user = user;
				res.redirect('/');
			}
		} catch (error) {
			res.render('login', { error: `${error}` });
		}
	});

auth.route('/logout').get((req, res) => {
	req.session.destroy(() => console.log('User Logged Out.'));
	res.redirect('/login');
});

export const checkLogin = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
};

export default auth;
