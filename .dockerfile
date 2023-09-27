# Use an official Node.js runtime as a parent image
FROM node:14

# Set environmental variables
ENV URL "http://localhost:6060/debug/pprof/heap"
ENV SERVICE "Test_Mainet"
ENV ITERATION 10
ENV DURATION 30
ENV BUCKET "gs://BUCKET_NAME"
ENV DEV_PORT 3080

# Create a directory for your app
WORKDIR /app

# Copy your Node.js app files to the container
COPY . .

# Install app dependencies
RUN npm install

# Expose the port your app will run on (if needed)
# EXPOSE 3080

# Define the command to run your app
CMD ["npm", "start"]
