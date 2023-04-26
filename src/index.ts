import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app: Application =express();
app.use(cors<Request>());
app.use(bodyParser.json())
const PORT = process.env.PORT;

// Test
app.get(`/`, (req: Request, res: Response) => {
    res.send('Hello World');
});

// Student Login
app.post(`/student/login`, (req: Request, res: Response) : void => {
    if(req.body.erno===null || req.body.erno===undefined){
        res.status(400);
        res.json({
            message: 'Enrollment Number is required'
        }).end();
    }
    if(req.body.password || req.body.password===undefined){
        res.status(400);
        res.json({
            message: 'Password is required'
        }).end();
    }
});

// Admin Login
app.post(`/student/login`, (req: Request, res: Response) : void => {
    if(req.body.erno===null || req.body.erno===undefined){
        res.status(400);
        res.json({
            message: 'Enrollment Number is required'
        }).end();
    }
    if(req.body.password || req.body.password===undefined){
        res.status(400);
        res.json({
            message: 'Password is required'
        }).end();
    }
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})