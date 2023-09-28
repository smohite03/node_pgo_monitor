# Use an official Node.js runtime as a parent image
FROM node:14

# Create a directory for your app
WORKDIR /app

# Copy your Node.js app files to the container
COPY . .

# Install app dependencies
RUN npm install

# Expose the port your app will run on (if needed)
EXPOSE 3090

# Define the command to run your app
CMD ["npm", "start"]
