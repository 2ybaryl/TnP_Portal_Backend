import AWS from 'aws-sdk';
import { GetItemInput } from 'aws-sdk/clients/dynamodb';

require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dynamoClient = new AWS.DynamoDB.DocumentClient();


// Placement Policy Table Functions

// Fetching 
export const getPlacementPolicy = async() : Promise<Object> => {
    const params = {
        TableName: 'placementPolicy'
    };
    const response = await dynamoClient.scan(params).promise();
    return response;
}

// Editing Placement Policy
export const editPlacementPolicy  = async() : Promise<Object> => {
    const params = {
        TableName: 'placementPolicy'
    };
    // const response = await 
    return {};
}


// Jobs Table Functions

// Fetching all Jobs
export const getJobs = async () : Promise<Object> => {
    const params = {
        TableName: 'jobs',
    }
    let res: object = {};
    await dynamoClient.scan(params).promise()
    .then((response)=>{
        res=response;
    })
    .catch((error)=>{
        if(error.statusCode===400){
            res={message: 'Error Occurred'};
        }
    });
    return res;
}

// Fetch a specific Job using ID
export const getJobsByID = async (id: String) : Promise<Object> => {
    const params = {
        TableName: 'jobs',
        Key: {
            job_id: id
        }
    }
    let res: object = {};
    await dynamoClient.get(params).promise()
    .then((response)=>{
        res=response;
    })
    .catch((error)=>{
        if(error.statusCode===400){
            res={message: 'Error Occurred'};
        }
    });
    return res;
}

// Add or Update a Job
export const createJob = async (item: Object) : Promise<boolean> => {
    const params = {
        TableName: 'jobs',
        Item: item
    }
    let res: boolean = false;
    await dynamoClient.put(params).promise()
    .then((response)=>{
        console.log(response);
        res=true;
    })
    .catch((error)=>{
        console.log(error);
        if(error.statusCode===400){
            res=false;
        }
    });
    return res;
}

// Delete an existing Job
export const deleteJob = async (id: String) : Promise<boolean> => {
    console.log(id);
    return true;
}

// User table Functions

// Fetching User Credentials

export const userDetails = async (id : String) : Promise<Object> => {
    const params = {
        TableName: 'users',
        Key: {
            erno: id,
        },
    }
    return await dynamoClient.get(params).promise();
}

export const studentGet = async () : Promise<void> => {
    const params={
        TableName: 'users'
    }
    const response = await dynamoClient.scan(params).promise();
    console.log(response);
}

export const studentPost = async (item : JSON) : Promise<boolean> => {
    const params = {
        TableName: 'users',
        Item: item
    }
    let res : boolean = false;
    await dynamoClient.put(params).promise()
    .then((response)=>{
        console.log('res', response);
        res=true;
    }).catch((error)=>{
        console.log(error);
        res = false;
    });
    return res;
}