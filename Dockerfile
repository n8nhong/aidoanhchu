FROM node:20-alpine

# Cài đặt thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build dự án (Vite + ESBuild cho server)
RUN npm run build

# Thiết lập môi trường production
ENV NODE_ENV=production

# Port mặc định của Cloud Run
EXPOSE 8080

# Chạy server
CMD ["npm", "start"]
# Force rebuild after title change (AIDOANHCHU)
