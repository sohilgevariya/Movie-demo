import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors'
import * as packageInfo from '../package.json'
import { mongooseConnection } from './database'
import { router } from './routes'
const app = express();
const ObjectId = require('mongoose').Types.ObjectId
console.log(process.env.NODE_ENV || 'localhost');
app.use(mongooseConnection)
app.use(cors())
app.use(bodyParser.json({ limit: "200mb" }))
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }))

const health = (req, res) => {
    return res.status(200).json({
        message: "Movie backend server is running",
        app: packageInfo.name,
        version: packageInfo.version,
        author: packageInfo.author,
        license: packageInfo.license,
        contributors: packageInfo.contributors
    })
}
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Movie Backend API Bad Gateway" }) }
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use('', router)
app.use('*', bad_gateway);
const server = new http.Server(app);

export default server;
