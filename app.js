import http from 'http';
import axios from 'axios';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const { URL, SERVICE, DURATION, ITERATION, BUCKET } = process.env;

// Initialize Google Cloud Storage client
const storage = new Storage();

// Function to make a request to the specified URL
const fetchData = async (fileName) => {
    const urlWithQuery = `${URL}?seconds=${DURATION}`;
    const response = await axios.get(urlWithQuery)
	.then((response) => {
	  fs.writeFileSync(fileName, response.data);
	  console.log(`Data from ${URL} saved to ${fileName}`);
	})
	.catch((error) => {
	  console.error('Error:', error.message);
	});
};

// Function to upload a file to Google Cloud Storage
const uploadFileToBucket = async (fileName) => {
	console.log("Uploaded", fileName);
//   try {
//     await storage.bucket(BUCKET).upload(fileName);
//     console.log(`Uploaded ${fileName} to ${BUCKET}`);
//   } catch (error) {
//     console.error('Error uploading file:', error.message);
//     throw error;
//   }
};

// Function to delete a local file
const deleteFile = (fileName) => {
  fs.unlinkSync(fileName);
  console.log(`Deleted ${fileName}`);
};

// Schedule tasks at random times in a day
const scheduleTasks = async () => {
	for (let i = 0; i < ITERATION; i++) {
		const randomMinutes = Math.floor(Math.random() * 60);
    	const cronExpression = `*/${randomMinutes} * * * *`;
		cron.schedule(cronExpression, async () => {
			const currentTimestamp = Date.now();
			const fileName = `./pgo_files/${SERVICE}-${currentTimestamp}.pprof`;
			try {
				await fetchData(fileName);
				await uploadFileToBucket(fileName);
				deleteFile(fileName);
			} catch (error) {
				console.error('Task failed:', error.message);
			}
		});
	}
};
scheduleTasks();

const port = process.env.DEV_PORT || 8000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server is running');
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
