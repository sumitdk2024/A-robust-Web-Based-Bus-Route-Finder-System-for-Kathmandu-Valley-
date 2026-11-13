FROM node:22-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY frontend/scripts/loadMainDataset.js /app/frontend/scripts/loadMainDataset.js
COPY data/main_dataset/ /app/data/main_dataset/
EXPOSE 5000
CMD ["npm", "start"]
