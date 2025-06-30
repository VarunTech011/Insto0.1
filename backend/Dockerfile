FROM node:22

WORKDIR /app
COPY ./backend/package.json ./
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon

COPY . .

EXPOSE 5000

# Start your app with nodemon (dev mode)
CMD ["npm", "run", "dev"]
