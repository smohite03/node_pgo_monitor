// Import necessary modules and libraries
import http from 'http'; // Import the built-in HTTP module
import axios from 'axios'; // Import Axios for making HTTP requests
import { Storage } from '@google-cloud/storage'; // Import Google Cloud Storage client
import fs from 'fs'; // Import the built-in File System module
import cron from 'node-cron'; // Import the Node.js cron library for scheduling
import dotenv from 'dotenv'; // Import the dotenv library for managing environment variables
dotenv.config(); // Load environment variables from a .env file

// Load environment variables from the .env file
let { URL, SERVICE, DURATION, ITERATION, BUCKET } = process.env;
ITERATION = ITERATION || 10;
DURATION = DURATION || 30;
// Initialize Google Cloud Storage client
const storage = new Storage();

// Function to log messages with timestamps
const logWithTimestamp = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// Schedule a cron job to run at 12 AM
cron.schedule('0 0 * * *', () => {
    console.log('Running generateRandomTimestamps at 12 AM...');
    scheduleTasks(); // Execute the scheduleTasks function
});

// Function to make a request to the specified URL and save the data to a file
const fetchData = async (fileName) => {
    const urlWithQuery = `${URL}?seconds=${DURATION}`;
    try {
        const response = await axios.get(urlWithQuery);
        fs.writeFileSync(fileName, response.data); // Save response data to a file
        logWithTimestamp(`Data from ${URL} saved to ${fileName}`);
    } catch (error) {
        logWithTimestamp(`Error: ${error.message}`);
    }
};

// Function to upload a file to Google Cloud Storage
const uploadFileToBucket = async (fileName) => {
    try {
        await storage.bucket(BUCKET).upload(fileName); // Upload the file to the specified bucket
        logWithTimestamp(`Uploaded ${fileName} to ${BUCKET}`);
    } catch (error) {
        logWithTimestamp(`Error Uploading File: ${error.message}`);
        throw error;
    }
};

// Function to delete a local file
const deleteFile = (fileName) => {
    fs.unlinkSync(fileName); // Delete the specified file
    logWithTimestamp(`Deleted ${fileName}`);
};

// Schedule tasks at random times in a day
const scheduleTasks = async () => {
    for (let i = 0; i < ITERATION; i++) {
        const randomMinutes = Math.floor(Math.random() * 60);
        const randomHours = Math.floor(Math.random() * 24);
        const cronExpression = `*/${randomMinutes} ${randomHours} * * *`;
        logWithTimestamp(`Scheduling Jobs Hours ${randomHours} : Minutes: ${randomMinutes}`);
        
        // Schedule a task using cron
        cron.schedule(cronExpression, async () => {
            const currentTimestamp = Date.now();
            const fileName = `${SERVICE}-${currentTimestamp}.pprof`;
            try {
                await fetchData(fileName); // Fetch data from the URL and save it
                await uploadFileToBucket(fileName); // Upload the file to GCS
                deleteFile(fileName); // Delete the local file
            } catch (error) {
                logWithTimestamp(`Task Failed: ${error.message}`);
            }
        });
    }
};

// Create an HTTP server
const port = process.env.DEV_PORT || 8000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP server is running');
});

// Start the HTTP server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
