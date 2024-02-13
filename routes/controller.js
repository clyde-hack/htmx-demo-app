import fs from 'fs';
import db from '../db.js';
import bcrypt from 'bcryptjs';

export const home = (req, res) => {
	res.render('index', { user: req.session.user });
};

export const register = (req, res) => {
	res.render('register', { user: req.session.user });
};

export const editUser = async (req, res) => {
	const sql = 'SELECT * FROM Users WHERE id = ?';
	const values = [req.params.id];

	try {
		const [result, fields] = await db.execute(sql, values);

		res.render('edit-user', {
			user: req.session.user,
			userId: req.params.id,
			firstName: result[0].firstName,
			lastName: result[0].lastName,
			email: result[0].email,
			password: result[0].password,
			avatar: result[0].avatar
		});
	} catch (error) {
		const response = `${error}`;

		res.send(response);
	}
};

export const getUsers = async (req, res) => {
	const sql = 'SELECT * FROM Users LIMIT ? OFFSET ?';
	const values = [req.query?.limit ?? '10', req.query?.offset ?? '0'];

	try {
		const [results, fields] = await db.execute(sql, values);
		const response = `
            ${results
							.map((item) => {
								return `<article class="card">
            <img class="card__img" src="${item.avatar || './assets/avatar.png'}" alt="User Avatar" />
            <strong class="card__headline">${item.firstName} ${item.lastName}</strong>
            <span class="card__subtext">${item.email}</span>
            <menu class="card__toolbar">
                <li>
                    <a href="/edit-user/${item.id}" title="Edit ${item.firstName} ${item.lastName}">
                        <i class="fas fa-edit"></i>
                    </a>
                </li>
                <li>
                    <button 
                        type="button" 
                        title="Delete ${item.firstName} ${item.lastName}"
                        hx-delete="/users/${item.id}" 
                        hx-target="dialog" 
                        hx-on::after-request="document.querySelector('dialog').showModal()"
                        hx-indicator="#spinner"
                        hx-confirm="Are you you want to delete user 
                        ${item.firstName} ${item.lastName}?">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </li>
            </menu>
        </article>`;
							})
							.join('')}`;

		setTimeout(() => res.send(response), 1000);
	} catch (error) {
		const response = `
            <div class="statusBox statusBox--error">
                <strong>${error}</strong>
            </div>`;

		res.send(response);
	}
};

export const postUser = async (req, res) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const sql = req.file
		? 'INSERT INTO Users (firstName, lastName, email, password, avatar) VALUES (?, ?, ?, ?, ?)'
		: 'INSERT INTO Users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';

	const values = req.file
		? [req.body.firstName, req.body.lastName, req.body.email, hashedPassword, req.file.filename]
		: [req.body.firstName, req.body.lastName, req.body.email, hashedPassword];

	try {
		const [result, fields] = await db.execute(sql, values);
		const response = 'User registered successfully.';

		setTimeout(() => res.send(response), 1000);
	} catch (error) {
		const response = `${error}`;

		res.send(response);
	}
};

export const updateUser = async (req, res) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const sql = req.file
		? 'UPDATE Users SET firstName = ?, lastName = ?, email = ?, password = ?, avatar = ? WHERE id = ?'
		: 'UPDATE Users SET firstName = ?, lastName = ?, email = ?, password = ? WHERE id = ?';
	const values = req.file
		? [req.body.firstName, req.body.lastName, req.body.email, hashedPassword, req.file.filename, +req.params.id]
		: [req.body.firstName, req.body.lastName, req.body.email, hashedPassword, +req.params.id];

	try {
		const [result, fields] = await db.execute(sql, values);
		const responseHtml = 'User updated successfully.';

		setTimeout(() => res.send(responseHtml), 1000);
	} catch (error) {
		const responseHtml = `${error}`;

		res.send(responseHtml);
	}
};

export const deleteUser = async (req, res) => {
	const sql = 'DELETE FROM Users WHERE id = ?';
	const values = [+req.params.id];

	try {
		const [result, fields] = await db.execute(sql, values);
		const response = 'User deleted.';

		setTimeout(() => res.append('Hx-Trigger', 'refreshUsers').send(response), 1000);
	} catch (error) {
		const response = `${error}`;

		res.send(response);
	}
};

export const deleteAvatar = async (req, res, next) => {
	const sql = 'SELECT avatar FROM Users WHERE id = ?';
	const values = [+req.params.id];

	try {
		const [result, fields] = await db.execute(sql, values);

		if (result[0].avatar) {
			fs.unlinkSync(`uploads/${result[0].avatar}`);
		}

		next();
	} catch (error) {
		console.error(error);
		res.end();
	}
};
