import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { studentPost, getJobs, getJobsByID, createJob, getPlacementPolicy, userDetails } from './dynamo';
require('dotenv').config();

const app: Application =express();
app.use(cors<Request>());
app.use(bodyParser.json())
const PORT = process.env.PORT;

// Test
app.get(`/`, (req: Request, res: Response) => {
    res.send('Hello World');
});


// Common APIs

// Get all current Jobs
app.get(`/jobs`, (req: Request, res: Response) : boolean => {
    getJobs()
    .then((response)=>{
        res.status(200);
        res.json(response).end();
        return true;
    })
    .catch((error)=>{
        res.status(500);
        res.json(error).end();
        return false;
    })
    return true;
});

// Get Specific Job by ID
app.get(`/jobs/:id`, (req: Request, res: Response) : boolean => {
    const id = req.params.id;
    if(id===undefined || id===null || id===''){
        res.status(400);
        res.json({
            message: 'No Job ID specified'
        }).end();
        return false;
    }
    getJobsByID(id)
    .then((response)=>{
        if(Object.keys(response).length===0){
            res.status(400);
            res.json({
                message: 'Job not Found'
            }).end();
            return false;
        }
        res.status(200);
        res.json(response).end();
        return true;
    })
    .catch((error)=>{
        res.status(500);
        res.json(error).end();
        return false;
    });
    return true;
});

// Get details regarding placement policy
app.get(`/placement-policy`, (req: Request, res: Response) : boolean => {
    getPlacementPolicy()
    .then((response) => {
        res.status(200);
        res.json(response).end();
        return true;
    })
    .catch((error)=>{
        res.status(500);
        res.json(error).end();
        return false;
    });
    return false;
});



// Student APIs

// Student Login
app.post(`/student/login`, (req: Request, res: Response) : boolean => {
    if(req.body.erno===null || req.body.erno===undefined){
        res.status(400);
        res.json({
            message: 'Enrollment Number is required'
        }).end();
        return false;
    }
    if(req.body.password===null || req.body.password===undefined){
        res.status(400);
        res.json({
            message: 'Password is required'
        }).end();
        return false;
    }
    userDetails(req.body.erno)
    .then((response)=>{
        console.log(response);
        if(Object.keys(response).length===0){
            res.status(400);
            res.json({
                message: 'No matching user exists'
            }).end();
            return false;
        }
        if(response) {
            // ---------------------------- Code here ----------------------------
        } else {
            res.status(500);
            res.json({
                message: 'Error Occurred'
            }).end();
            return false;
        }
    });
    return true;
});

// Student Profile 
app.get(`/student/profile/:id`, (req: Request, res : Response) : boolean => {
    const id = req.params.id;
    if(id===undefined || id===null || id===''){
        res.status(400);
        res.json({
            message: 'No Enrollment Number specified'
        }).end();
        return false;
    } else {
        userDetails(id)
        .then((response)=>{
            if(Object.keys(response).length!==0){
                res.status(200);
                res.json(response).end();
                return true;
            } else {
                res.status(400);
                res.json({
                    message: 'No matching user exists'
                }).end();
                return false;
            }
        })
    }
    return true;
})

// Applying to a Job
app.post(`/student/apply`, (req: Request, res: Response) : boolean => {
    if(req.body.job_id==='' || req.body.job_id === undefined || req.body.job_id === null){
        res.status(200);
        res.json({
            message: 'Job ID is required'
        }).end();
        return false;
    }
    if(req.body.erno==='' || req.body.erno === undefined || req.body.erno === null){
        res.status(200);
        res.json({
            message: 'Enrollment Number is required'
        }).end();
        return false;
    }
    // ---------------------------- Code here ----------------------------
    getJobsByID(req.body.job_id)
    .then((response)=>{
        if(Object.keys(response).length===0){
            res.status(400);
            res.json({
                message: 'No matching Job found'
            }).end();
            return false;
        }
        if(Object.values(response)[0].round_details[0].erno.find((item: String)=>{return item===req.body.erno})){
            res.status(300);
            res.json({
                message: 'You have already applied to this job'
            }).end();
            return false;
        }
        Object.values(response)[0].round_details[0].erno.push(req.body.erno);
        console.log(Object.values(response)[0].round_details[0]);
        createJob(Object.values(response)[0])
        .then((resp)=>{
            console.log(resp);
            if(resp){
                res.status(200);
                res.json({
                    message: 'You have successfully applied!'
                }).end();
                return true;
            } else {
                res.status(500);
                res.json({
                    message: 'Error Occurred'
                }).end();
                return false;
            }
        }).catch((error)=>{
            res.status(500);
            res.json({
                message: 'Error Occurred'
            }).end();
            return false;
        })
    })
    return true;
})



// Admin APIs

// Admin Login
app.post(`/admin/login`, (req: Request, res: Response) : boolean => {
    if(req.body.empid===null || req.body.empid===undefined){
        res.status(400);
        res.json({
            message: 'Enrollment Number is required'
        }).end();
        return false;
    }
    if(req.body.password || req.body.password===undefined){
        res.status(400);
        res.json({
            message: 'Password is required'
        }).end();
        return false;
    }
    // studentPost(req.body)
    // .then((response)=>{
    //     console.log(response);
    //     if(response) {
    //         res.status(200);
    //         res.json({
    //             message: 'Success!'
    //         }).end();
    //         return true;
    //     } else {
    //         res.status(400);
    //         res.json({
    //             message: 'Error Occurred'
    //         }).end();
    //         console.log(12);
    //         return false;
    //     }
    // });
    return true;
});

// Create a new Job
let counter = 0; // Job ID will be decided using this
app.post(`/admin/jobs`, (req: Request, res: Response) : boolean => {
    counter++;
    if(req.body.batch==='' || req.body.batch===null || req.body.batch===undefined){
        res.status(400);
        res.json({
            message: 'Batch is required'
        }).end();
        return false;
    }
    if(req.body.company_id==='' || req.body.company_id===null || req.body.company_id===undefined){
        res.status(400);
        res.json({
            message: 'company ID is required'
        }).end();
        return false;
    }
    if(req.body.posted_date==='' || req.body.posted_date===null || req.body.posted_date===undefined){
        res.status(400);
        res.json({
            message: 'posted date is required'
        }).end();
        return false;
    }
    if(req.body.posted_by==='' || req.body.posted_by===null || req.body.posted_by===undefined){
        res.status(400);
        res.json({
            message: 'Posted By is required'
        }).end();
        return false;
    }
    if(req.body.last_date==='' || req.body.last_date===null || req.body.last_date===undefined){
        res.status(400);
        res.json({
            message: 'last date is required'
        }).end();
        return false;
    }
    if(req.body.type==='' || req.body.type===null || req.body.type===undefined){
        res.status(400);
        res.json({
            message: 'type is required'
        }).end();
        return false;
    }
    if(req.body.location==='' || req.body.location===null || req.body.location===undefined){
        res.status(400);
        res.json({
            message: 'location is required'
        }).end();
        return false;
    }
    if(req.body.offer==='' || req.body.offer===null || req.body.offer===undefined){
        res.status(400);
        res.json({
            message: 'offer is required'
        }).end();
        return false;
    }
    if(req.body.skills==='' || req.body.skills===null || req.body.skills===undefined){
        res.status(400);
        res.json({
            message: 'skills is required'
        }).end();
        return false;
    }
    if(req.body.about==='' || req.body.about===null || req.body.about===undefined){
        res.status(400);
        res.json({
            message: 'about is required'
        }).end();
        return false;
    }
    if(req.body.role==='' || req.body.role===null || req.body.role===undefined){
        res.status(400);
        res.json({
            message: 'role is required'
        }).end();
        return false;
    }
    const newJob = {
        job_id: counter.toString(),
        program_name: req.body.program_name,
        batch: req.body.batch,
        company_id: req.body.company_id,
        posted_date: req.body.posted_date,
        posted_by: req.body.posted_by,
        last_date: req.body.last_date,
        type: req.body.type,
        location: req.body.location,
        no_of_positions: req.body.no_of_positions,
        time: req.body.time,
        offer: req.body.offer,
        duration: req.body.duration,
        ppo: req.body.ppo,
        skills: req.body.skills,
        about: req.body.about,
        role: req.body.role,
        backlogs: req.body.backlogs,
        extra: req.body.extra,
        round_details: [{erno: []}],
        selected: 0,
        applied: 0
    }
    counter++;
    createJob(newJob)
    .then((response)=>{
        if(response){
            res.status(200);
            res.json({
                message: 'Job Created Successfully!'
            }).end();
            return true;
        } else {
            res.status(500);
            res.json({
                message: 'Error Occurred'
            }).end();
            return false;
        }
    })
    .catch((error)=>{
        res.status(500);
        res.json({
            message: 'Error Occurred'
        }).end();
        return false;
    })
    return true;
});

// Edit an existing Job
app.put(`/admin/jobs`, (req: Request, res: Response) : boolean => {
    if(req.body.job_id==='' || req.body.job_id===null || req.body.job_id===undefined){
        res.status(400);
        res.json({
            message: 'Job ID is required'
        }).end();
        return false;
    }
    if(req.body.batch==='' || req.body.batch===null || req.body.batch===undefined){
        res.status(400);
        res.json({
            message: 'Batch is required'
        }).end();
        return false;
    }
    if(req.body.company_id==='' || req.body.company_id===null || req.body.company_id===undefined){
        res.status(400);
        res.json({
            message: 'company ID is required'
        }).end();
        return false;
    }
    if(req.body.posted_date==='' || req.body.posted_date===null || req.body.posted_date===undefined){
        res.status(400);
        res.json({
            message: 'posted date is required'
        }).end();
        return false;
    }
    if(req.body.posted_by==='' || req.body.posted_by===null || req.body.posted_by===undefined){
        res.status(400);
        res.json({
            message: 'Posted By is required'
        }).end();
        return false;
    }
    if(req.body.last_date==='' || req.body.last_date===null || req.body.last_date===undefined){
        res.status(400);
        res.json({
            message: 'last date is required'
        }).end();
        return false;
    }
    if(req.body.type==='' || req.body.type===null || req.body.type===undefined){
        res.status(400);
        res.json({
            message: 'type is required'
        }).end();
        return false;
    }
    if(req.body.location==='' || req.body.location===null || req.body.location===undefined){
        res.status(400);
        res.json({
            message: 'location is required'
        }).end();
        return false;
    }
    if(req.body.offer==='' || req.body.offer===null || req.body.offer===undefined){
        res.status(400);
        res.json({
            message: 'offer is required'
        }).end();
        return false;
    }
    if(req.body.skills==='' || req.body.skills===null || req.body.skills===undefined){
        res.status(400);
        res.json({
            message: 'skills is required'
        }).end();
        return false;
    }
    if(req.body.about==='' || req.body.about===null || req.body.about===undefined){
        res.status(400);
        res.json({
            message: 'about is required'
        }).end();
        return false;
    }
    if(req.body.role==='' || req.body.role===null || req.body.role===undefined){
        res.status(400);
        res.json({
            message: 'role is required'
        }).end();
        return false;
    }
    const newJob = {
        program_name: req.body.program_name,
        batch: req.body.batch,
        company_id: req.body.company_id,
        posted_date: req.body.posted_date,
        posted_by: req.body.posted_by,
        last_date: req.body.last_date,
        type: req.body.type,
        location: req.body.location,
        no_of_positions: req.body.no_of_positions,
        time: req.body.time,
        offer: req.body.offer,
        duration: req.body.duration,
        ppo: req.body.ppo,
        skills: req.body.skills,
        about: req.body.about,
        role: req.body.role,
        backlogs: req.body.backlogs,
        extra: req.body.extra,
        round_details: [],
        selected: 0,
        applied: 0
    }
    createJob(newJob)
    .then((response)=>{
        if(response){
            res.status(200);
            res.json('Job Created Successfully!').end();
            return true;
        } else {
            res.status(500);
            res.json('Error Occurred').end();
            return false;
        }
    })
    return true;
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})