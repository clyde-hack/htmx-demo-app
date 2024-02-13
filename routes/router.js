import express from 'express';
import multer from 'multer';
import { checkLogin } from './auth.js';
import { home, register, editUser, getUsers, postUser, updateUser, deleteAvatar, deleteUser } from './controller.js';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, `${Math.round(Math.random() * 1e9)}.${file.mimetype.replace('image/', '')}`);
	}
});
const upload = multer({ storage: storage });
const router = express.Router();

router.route('/').get(checkLogin, home);

router.route('/register').get(register);

router.route('/edit-user/:id').get(checkLogin, editUser);

router.route('/users').get(getUsers).post(upload.single('avatar'), postUser);

router.route('/users/:id').put(upload.single('avatar'), updateUser).delete(deleteAvatar, deleteUser);

export default router;
