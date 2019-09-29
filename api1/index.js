const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mysql = require("mysql");
const Movie = require("./Movie");
const app = express();
const PORT = 8081;

// const HOST = "mongodb";
const MONGO_HOST = "mongo-service";
const MONGO_PORT = 27017;
const MONGO_USERNAME = "root";
const MONGO_PASSWORD = "example";
const MONGO_DB = "test";

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

function onConnection() {
    const db = mongoose.connection;

    return new Promise((resolve, reject) => {
        db.on("error", (err) => {
            return reject(err);
        });

        db.on("open", () => {
            return resolve();
        });
    })
}

async function mysqlConnection() {
    const connection = mysql.createConnection({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
    });

    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                return reject(err);
            }
            return resolve(connection);
        });
    });     
}

function monkeyPatchQuery(connection) {
    let queryBackup = connection.query;
    connection.queryBackup = queryBackup;    

    connection.query = (sql, cb) => {
        return new Promise((resolve, reject) => {
            connection.queryBackup(sql, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }
                return resolve({
                    results: results,
                    fields: fields,
                });
            });
        });
    }

    console.log("connection.query monkey-patched!");
}

(async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true, }));

    // mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,        
    // });

    // try {
    //     await onConnection();
    // } catch(err) {
    //     console.error(err);
    //     process.exit(1);
    // }
    
    // console.log("Mongoose connected!");
    
    console.log(MYSQL_HOST);
    console.log(MYSQL_PORT);
    console.log(MYSQL_USER);
    console.log(MYSQL_PASSWORD);    
    console.log(MYSQL_DATABASE);
    
    let connection;
    try {
        connection = await mysqlConnection();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }

    console.log("MySQL connected!");

    monkeyPatchQuery(connection);
    // console.log(connection);

    const tableName = "movie";

    await connection.query(`
        CREATE TABLE IF NOT EXISTS ${MYSQL_DATABASE}.${tableName}
        (
            title varchar(80),
            year int
        )
    `);   
    
    // app.get("/api1", (req, res) => {
    //     Movie.find({ }, (err, movies) => {
    //         if (err) {
    //             res.status(400);
    //             return res.send(err);
    //         }
    //         return res.json(movies.map(m => {
    //             return {
    //                 title: m.title,
    //                 year: m.year,
    //             };
    //         }));
    //     });
    // });

    // app.post("/api1", (req, res) => {
    //     const { title, year } = req.body;
    //     const movie = new Movie({ title, year });
    //     movie.save((err, data) => {
    //         if (err) {
    //             res.status(400);
    //             return res.send(err);
    //         }
    //         res.status(201);
    //         return res.send(data);
    //     })
    // });

    app.get("/api1", async (req, res) => {
        try {
            const { results, fields } = await connection.query(`
                SELECT * FROM ${MYSQL_DATABASE}.${tableName}
            `);            
            return res.json(results);
        } catch(err) {
            console.error(err);
            res.status(400);
            return res.send(err);
        }
    });

    app.post("/api1", async (req, res) => {        
        const { title, year } = req.body;
        try {
            const { results, field } = await connection.query(`
                INSERT INTO ${MYSQL_DATABASE}.${tableName} (title, year)
                VALUES ('${title}', '${year}')
            `);
            res.status(201);
            return res.json({ msg: "Ok! ^_^" });
        } catch(err) {
            console.error(err);
            res.status(400);
            return res.send(err);
        }
    });

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    });

})();


