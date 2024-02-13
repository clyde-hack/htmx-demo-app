import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import hbs from 'hbs';
import auth from './routes/auth.js';
import router from './routes/router.js';

const app = express();
const port = process.env.PORT;

app.set('view engine', 'html');
app.engine('html', hbs.__express);
hbs.registerPartials('./views/partials', {
	header: 'header.html',
	footer: 'footer.html'
});

app.use(
	session({
		secret: process.env.SESS_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 3600000 }
	})
);
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', auth);
app.use('/', router);

app.listen(port, () => console.log(`Server running on port ${port}...`));
