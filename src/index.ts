import express, { Application, Request, Response, response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { studentPost, getJobs, getJobsByID, createJob, getPlacementPolicy, userDetails, createAdmin, deleteJob, login, getCompanies, getCompaniesByID, getAdmin } from './DynamoDB/dynamo';
import * as dotenv from 'dotenv';
import { assign, verify } from './Auth/jwtAuth';
import { generateHas, verifyPassword } from './Auth/hashFunctions';
dotenv.config();

const app: Application =express();
app.use(cors<Request>());
app.use(bodyParser.json())
const PORT = process.env.PORT;

// Test
app.get(`/`, (req: Request, res: Response) : boolean => {
    res.send('Hello World');
    return true;
});

// ONLY FOR TESTING, REMOVE ONCE IMPLEMENTED
app.post('/test', (req: Request, res: Response)=>{
    // For Assigning a JWT
    // assign("201B163", 1)
    // .then((response)=>{
    //     res.status(200);
    //     res.json({
    //         token: response
    //     }).end();
    // }).catch((error)=>{
    //     res.status(400);
    //     res.json({
    //         message: 'Error Occured'
    //     }).end();
    // })

    // For Verification of JWT
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        // Insert your code here
        res.json(response).end();
        return true;
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
            return false;
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
            return false;
        }
    });
})


// Common APIs

// Get all Company Details
app.get(`/companies`, (req: Request, res: Response) : boolean => {
    getCompanies()
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

app.get(`/companies/:id`, (req: Request, res: Response) : boolean => {
    const id = req.params.id;
    if(id===undefined || id===null || id===''){
        res.status(400);
        res.json({
            message: 'No Company ID specified'
        }).end();
        return false;
    }
    getCompaniesByID(id)
    .then((response)=>{
        if(Object.keys(response).length===0){
            res.status(400);
            res.json({
                message: 'Company not Found'
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
    // userDetails(req.body.erno)
    login(req.body.erno, req.body.password)
    .then((response)=>{
        if(Object.keys(response).length===0){
            res.status(400);
            res.json({
                message: 'No matching user exists'
            }).end();
            return false;
        }
        if(response) {
            verifyPassword(req.body.password, Object.values(response)[0].password)
            .then((r)=>{
                if(r){
                    res.status(200);
                    res.json({
                        message: 'Welcome back!'
                    }).end();
                    return true;
                } else {
                    res.status(401);
                    res.json({
                        message: 'Invalid Password'
                    }).end();
                    return false;
                }
            }).catch((err)=>{
                res.status(500);
                res.json({
                    message: 'Error Occurred'
                }).end();
                return false;
            });
            // assign(req.body.erno, 1)
            // .then((response)=>{
            //     res.status(200);
            //     res.json({
            //         token: response
            //     }).end();
            // }).catch((error)=>{
            //     res.status(500);
            //     res.json({
            //         message: 'Error Occured'
            //     }).end();
            // });
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
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        if(Object.keys(response)[1]==='role' && Object.values(response)[1]===1 && Object.values(response)[0]===req.params.id){    
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
        } else {
            res.status(403);
            res.json({
                message: 'Not Authorized!'
            }).end();
            return false;
        }
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
        }
    })
    return true;
})

// Applying to a Job
app.post(`/student/apply`, (req: Request, res: Response) : boolean => {
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        // Insert your code here
        if(Object.keys(response)[1]==='role' && Object.values(response)[1]===1){
            const id : String = Object.values(response)[0];
            if(req.body.job_id==='' || req.body.job_id === undefined || req.body.job_id === null){
                res.status(200);
                res.json({
                    message: 'Job ID is required'
                }).end();
                return false;
            }
            getJobsByID(req.body.job_id)
            .then((response)=>{
                if(Object.keys(response).length===0){
                    res.status(400);
                    res.json({
                        message: 'No matching Job found'
                    }).end();
                    return false;
                }
                if(Object.values(response)[0].round_details[0].erno.find((item: String)=>{return item===id})){
                    res.status(300);
                    res.json({
                        message: 'You have already applied to this job'
                    }).end();
                    return false;
                }
                Object.values(response)[0].round_details[0].erno.push(id);
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
            });
        } else {
            res.status(403);
            res.json({
                message: 'Admins cannot apply to a Job!'
            }).end();
            return false;
        }
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
            return false;
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
            return false;
        }
    });
    return true;
})



// Admin APIs

// Admin profile
app.get(`/admin/profile/:id`, (req: Request, res: Response) : boolean => {
    if(req.params.id===null || req.params.id === undefined || req.params.id === ''){
        res.status(400);
        res.json({
            message: 'No profile ID provided'
        }).end();
        return false;
    }
    getAdmin(req.params.id).then((response)=>{
        res.status(200);
        res.json(response).end();
        return true;
    }).catch((err)=>{
        throw err;
    });
    return true;
});

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
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        if(Object.keys(response)[1]==='role' && (Object.values(response)[1]===2 || Object.values(response)[1]===3)){
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
        } else {
            res.status(403);
            res.json({
                message: 'Not Authorized!'
            }).end();
            return false;
        }
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
        }
    });
    return true;
});

// Edit an existing Job
app.put(`/admin/jobs`, (req: Request, res: Response) : boolean => {
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        if(Object.keys(response)[1]==='role' && (Object.values(response)[1]===2 || Object.values(response)[1]===3)){
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
            .then((r)=>{
                if(r){
                    res.status(200);
                    res.json('Job Created Successfully!').end();
                    return true;
                } else {
                    res.status(500);
                    res.json('Error Occurred').end();
                    return false;
                }
            });
        } else {
            res.status(403);
            res.json({
                message: 'Not Authorized!'
            }).end();
            return false;
        }
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
            return false;
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
            return false;
        }
    });
    return true;
});

// Delete a Job
app.delete(`/admin/jobs/:id`, (req: Request, res: Response) :boolean => {
    verify(req.headers.authorization?.split(" ")[1]!)
    .then((response)=>{
        if(Object.keys(response)[1]==='role' && (Object.values(response)[1]===2 || Object.values(response)[1]===3)){
            if(req.params.id){
                deleteJob(req.params.id)
                .then((r)=>{
                    if(r){
                        res.status(200);
                        res.json({
                            message: 'Job Deleted Successfully'
                        }).end();
                        return true;
                    } else {
                        res.status(500);
                        res.json({
                            message: 'Some Error Occurred'
                        }).end();
                        return false;
                    }
                }).catch((err)=>{
                    res.status(500);
                    res.json({
                        message: err.message
                    }).end();
                    return false;
                })
            } else {
                res.status(400);
                res.json({
                    message: 'No Job ID specified'
                }).end();
                return false;
            }
        } else {
            res.status(403);
            res.json({
                message: 'Not Authorized!'
            }).end();
            return false;
        }
    }).catch((error)=>{
        // res.status(400);
        if(error.name==='TokenExpiredError'){
            res.status(401);
            res.json({
                message: 'Token Expired'
            }).end();
            return false;
        } else {
            res.status(400);
            res.json({
                message: 'Token not Recieved'
            }).end();
            return false;
        }
    });
    return true;
});



// Super Admin APIs

// Create Admin Login
app.post(`/admin/super/createAdmin`, async (req: Request, res: Response) => {
    if(req.body.emp_no==='' || req.body.emp_no===null || req.body.emp_no===undefined){
        res.status(400);
        res.json({
            message: 'employee number is required'
        }).end();
        return false;
    }
    if(req.body.name==='' || req.body.name===null || req.body.name===undefined){
        res.status(400);
        res.json({
            message: 'name is required'
        }).end();
        return false;
    }
    if(req.body.designation==='' || req.body.designation===null || req.body.designation===undefined){
        res.status(400);
        res.json({
            message: 'designation is required'
        }).end();
        return false;
    }
    if(req.body.email==='' || req.body.email===null || req.body.email===undefined){
        res.status(400);
        res.json({
            message: 'email is required'
        }).end();
        return false;
    }
    if(req.body.contact ==='' || req.body.contact ===null || req.body.contact ===undefined){
        res.status(400);
        res.json({
            message: 'contact number is required'
        }).end();
        return false;
    }
    if(req.body.image==='' || req.body.image===null || req.body.image===undefined){
        res.status(400);
        res.json({
            message: 'image is required'
        }).end();
        return false;
    }
    if(req.body.password==='' || req.body.password===null || req.body.password===undefined){
        res.status(400);
        res.json({
            message: 'password is required'
        }).end();
        return false;
    }
    let pass : String = ''
    await generateHas(req.body.password).then((response)=>{
        pass = response;
    }).catch((error)=>{
        throw error;
    });
    const newAdmin = {
        emp_no: req.body.emp_no,
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        designation: req.body.designation,
        // image: 
        password: pass,
        super: req.body.super
    }
    createAdmin(newAdmin)
    .then((response)=>{
        if(response){
            res.status(200);
            res.json('Admin Added Successfully!').end();
            return true;
        } else {
            res.status(500);
            res.json('Error Occurred').end();
            return false;
        }
    })
    return true;
});



// Driver Code
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})