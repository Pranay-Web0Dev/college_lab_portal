const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const dbModule = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Express session middleware
app.use(session({
    key: 'college_lab_portal_session',
    secret: process.env.SESSION_SECRET || 'college_lab_portal_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 1 day in ms
    }
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up handlebars with proper helpers
const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        ifEquals: function(arg1, arg2, options) {
            return (String(arg1) === String(arg2)) ? options.fn(this) : options.inverse(this);
        },
        json: function(context) {
            return JSON.stringify(context);
        },
        add: function(a, b) {
            return a + b;
        },
        multiply: function(a, b) {
            return a * b;
        },
        divide: function(a, b) {
            return a / b;
        },
        toString: function(val) {
            return String(val);
        },
        some: function(collection, predicate) {
            if (!collection || !collection.length) return false;
            if (predicate === 'day') {
                // Specialized check for day of week
                const day = this;
                return collection.some(item => item.day_of_week === day);
            }
            return false;
        },
        formatDate: function(date) {
            return new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        },
        currentYear: function() {
            return new Date().getFullYear();
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.session.success_msg;
    res.locals.error_msg = req.session.error_msg;
    
    // Clear flash messages after they're used
    delete req.session.success_msg;
    delete req.session.error_msg;
    
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/student', require('./routes/student'));
app.use('/teacher', require('./routes/teacher'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('auth', {
        title: 'Page Not Found',
        error_msg: 'The page you requested does not exist.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('auth', {
        title: 'Server Error',
        error_msg: 'Something went wrong. Please try again later.'
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});
