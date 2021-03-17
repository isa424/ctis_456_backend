const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const {body, validationResult} = require('express-validator');
const cors = require('cors')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post(
	'/upload',
	body('source').isIn(['en', 'tr', 'ru', 'de']).withMessage('Invalid source language'),
	body('target').isIn(['en', 'tr', 'ru', 'de']).withMessage('Invalid target language'),
	(req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errorArr = errors.array();
			if (!!req.files || !!req.files.media && !!req.files.media.name) {
				errorArr = [
					...errorArr,
					{
						msg: 'File is required',
						param: 'media',
						location: 'files',
					}
				];
			}

			return res.status(400).json({errors: errorArr});
		}

		console.log(req.body);
		if (!req.files || !req.files.media || !req.files.media.name) {
			res.status(400).end();
		}

		const targetPath = __dirname + "/data/" + req.files.media.name;

		req.files.media.mv(targetPath, (err) => {
			if (err) {
				res.status(400).end();
			}

			setTimeout(() => {
				res.download(targetPath);
			}, 3000);
		});
	}
);

module.exports = app;
