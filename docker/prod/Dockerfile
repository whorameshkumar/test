# Step 1 
# So, hum node kaa version 18 use kr rehye hain aur alpine is lightweight image, in our case we are using node light weight image version 18
# as builder supports multi-layer
FROM node:18-alpine as builder 

# Set the working directory - yhe docker ki files sari iss path mein hongi  - yhe path docker container k ander hoga humari machine p nhi
# btw iss kaa path kuch bhi dye saktye ho zarori nhi k /app hi rakho
WORKDIR /app

# coping package.json and package-lock.json first to leverage Docker cache - yhe ./ means WORKDIR /usr/src/app jo docker container mein path hai
COPY package*.json ./

# Install app dependencies 
# npm i, npm ci, both are fine but ci kaa faida yhe hai yhe package.json.lock sye dependencies install krta hai. Faida agar future mein kisi library kaa version kuch aur bhi hojata hai tu no issues :)
RUN npm ci

# Copy rest of our app's source code into the container - . (first dot means backend kaa sara code humarye system kaa code) .(second to docker container ka path i.e. WORKDIR /app ) mein pora code copy hojaye
COPY . .

# Now, building our code, so iss command sye humara dist folder generate hojaye gaa
RUN npm run build








# Step 2
# Dekho so far, dist folder create hogaya hai
FROM node:18-alpine as production

# Passing environment variable 
ENV NODE_ENV=production

# Set the working directory - yhe docker ki files sari iss path mein hongi  - yhe path docker container k ander hoga humari machine p nhi
# btw iss kaa path kuch bhi dye saktye ho zarori nhi k /app hi rakho
WORKDIR /app

# coping package.json and package-lock.json first to leverage Docker cache - yhe ./ means WORKDIR /usr/src/app jo docker container mein path hai
COPY package*.json ./

# Install app dependencies 
# npm i, npm ci, both are fine but ci kaa faida yhe hai yhe package.json.lock sye dependencies install krta hai. Faida agar future mein kisi library kaa version kuch aur bhi hojata hai tu no issues :)
# --ignore-scripts third party script naa install hoon, tu uss kaa yhe flag hota hai for security reasons
# Important  --ignore-scripts yhe dev dependencies nhi install krye gaa
RUN npm ci --ignore-scripts
# RUN npm ci --ignore-scripts --omit=dev   # agar aesye liktye ho tu u don't need to write ENV NODE_ENV=production line

# builder step 1 mein tha tu step 1 and step 2 docker dono ko alag alag assumer krta hai 
# tu builder step 1 k workdir /app folder sye dist folder ko copy kro, aur uss ko iss step 2 k workdir /app mein daal du only dist folder, so image size bara nhi hoga, only JS code hoga
COPY --from=builder /app/dist ./

# Just for documentation purpose, ab iss kaa matlab yhe nhi k code port 5500 p chalna shru hojaye gaa kuch bhi port dye du, in real jb port set krtye hain tu remember -p flag use krtye hain hum 
EXPOSE 5500

# So, far upar hum n image ko build kra for prod

# Ab jesye hi container start hojaye gaa tu ab yhe command run hogi 
# tu iss command sye yhe hoga k /dist folder mein /src folder mein server.js file wo run hojaye gii
CMD ["node", "src/server.js"]
