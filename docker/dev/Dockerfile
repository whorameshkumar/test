# Official Node.js image, so node:18 is our base image, means yhe sample image hai node ki iss k upar hum additional functionality daalein gye  
FROM node:18

# Set the working directory - yhe docker ki files sari iss path mein hongi  - yhe path docker container k ander hoga humari machine p nhi
WORKDIR /usr/src/app

# coping package.json and package-lock.json first to leverage Docker cache - yhe ./ means WORKDIR /usr/src/app jo docker container mein path hai
COPY package*.json ./

# Install app dependencies 
RUN npm install

# Copy rest of our app's source code into the container - . (first dot means backend kaa sara code humarye system kaa code) .(second to docker container ka path i.e. WORKDIR /usr/src/app )
COPY . .

# Expose port the app will run on - dekho docker k ander docker kaa apna network hota hai ab hum n 3001 port bola wo humarye system sye kesye map hogi? using port binding 
# yhe bs documentation k liye hai user k liye k mera backend kis port p run hoga, koi bhi port du yahan koi farq nhi parta aur yhe actual mapping nhi krta bs yhe dummy port hai yahan 
EXPOSE 3001

# The command to run our app, npm run dev jo package.json mein hai in scripts
CMD ["npm", "run", "dev"]