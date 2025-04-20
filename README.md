# File Management System API

## Project Overview

This project is a Node.js-based File Management System API that allows users to manage folders and documents in a hierarchical structure. The API is built using a microservice architecture, consisting of three services:

- **User Service** - Manages user-related data and authentication.
- **Hierarchy Service** - Handles the creation and management of folders and subfolders.
- **Version Service** - Manages the versioning of documents.

Each service runs independently, and their interactions are designed to manage and version documents efficiently in a hierarchical folder structure.

---

## API Overview

The API supports the following core functionalities:

- **Folder Management**: Create, view, update, and delete folders.
- **Document Management**: Create, view, update, delete, and version documents.
- **Document Search**: Search documents by title or content with folder paths.
- **Document Count**: Get the total number of documents for the authenticated user.

---

## Microservices

### 1. User Service (Port: 3000)
- **Purpose**: Handles authentication and user management.
- **URL**: `http://localhost:3000`

### 2. Hierarchy Service (Port: 3001)
- **Purpose**: Manages folder structures, creating and updating folders.
- **URL**: `http://localhost:3001`

### 3. Version Service (Port: 3002)
- **Purpose**: Manages document versions, including version uploads and retrieval.
- **URL**: `http://localhost:3002`

---

## Services Overview

### Folder Endpoints

- `GET /viewstore`: Get root-level folders for the authenticated user.
- `GET /viewstore/:folderId`: Get content of a folder (subfolders and documents).
- `POST /folders`: Create a new folder.
- `PUT /folders/:id`: Rename folder.
- `DELETE /folders/:id`: Delete a folder.

### Document Endpoints

- `GET /documents/:id`: Get document details.
- `POST /documents`: Create a new document (placeholder).
- `POST /documents/:id/version`: Create a new version for a document.
- `GET /documents/:id/versions`: Get all versions of a document.
- `PUT /documents/:id`: Update document details.
- `DELETE /documents/:id`: Delete a document and all versions.

### Filter Endpoint

- `GET /filter`: Search for documents by title or content and return the folder path.

### Total Document Count Endpoint

- `GET /total-documents`: Get the total number of documents for the authenticated user.

---

## Installation and Setup

### Prerequisites

- **Node.js** (version 16 or higher)
- **MongoDB** (local or remote instance)
- **npm** (Node Package Manager)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/file-management-system.git
cd file-management-system
```

### 2. Install Dependencies for Each Service
Each service has its own set of dependencies. For each service, run the following:
```bash
cd user-service
npm install

cd hierarchy-service
npm install

cd version-service
npm install
```

### 3. Set Up Environment Variables
Make sure to set up the required environment variables for each service:

**User Service:** 
| Variable | Description with e.g. values |
|----------|-------------|
| `NODE_ENV` | development |
| `PORT` | 3000 |
| `DBURL` | mongodb://localhost:27017/filemanager-user-db |
| `JWT_USER_SECRETKEY` | somesecretkey |
| `SERVICE_PREFIX` | userservice/ |

**Heirarchy Service:** 
| Variable | Description with e.g. values |
|----------|-------------|
| `NODE_ENV` | development |
| `PORT` | 3001 |
| `DBURL` | mongodb://localhost:27017/filemanager-heirarchy-db |
| `JWT_USER_SECRETKEY` | somesecretkey |
| `INTERNAL_SECRET` | abcdveryimpotantsecretvalue |
| `VERSION_SERVICE_BASE_URL` | http://localhost:3002/versionservice/api/v1/documents (For Interservice communication) |
| `SERVICE_PREFIX` | userservice/ |

**Version Service:** 
| Variable | Description with e.g. values |
|----------|-------------|
| `NODE_ENV` | development |
| `PORT` | 3002 |
| `DBURL` | mongodb://localhost:27017/filemanager-version-db |
| `JWT_USER_SECRETKEY` | somesecret |
| `INTERNAL_SECRET` | abcdveryimpotantsecretvalue |
| `VERSION_SERVICE_BASE_URL` | http://localhost:3001/heirarchyservice/api/v1/documents (For Interservice communication) |
| `SERVICE_PREFIX` | versionservice/ |
### 4. Once all dependencies are installed, start the services:
```bash
cd user-service
npm start

cd hierarchy-service
npm start

cd version-service
npm start
```

> 📌 **Note:**  
> The `filemanagement-utils` project is a standalone utility package and **does not need to be cloned separately**.  
> It contains centralized and reusable logic used across all services, such as:
>
> - Logger configuration (Winston-based)
> - JWT token verification middleware
> - Microservice-to-microservice request validation
> - Global error handling utilities
> - Input validation (using Zod)
>
> This utility package is published to [npm](https://www.npmjs.com/package/filemanagement-utils) and is consumed directly as a dependency in each microservice.

## 📄 API Documentation

The postman collection and the environment variable file are included in the project root to help you get started:

- 📁 `file-management-system.postman_collection.json` – Import this collection into Postman to test all available endpoints.
- 📁 `file-management-system.postman_environment.json` – This file contains the required environment variables (such as base URLs and tokens) for the services to work properly.

Make sure to import both the collection and the environment file into Postman for a smooth testing experience.

---

## 🧩 Features and Architecture

### 🔧 Microservice Architecture

This project is structured using a microservice architecture with three distinct services:

- **User Service** : Manages user authentication and JWT token handling.
- **Hierarchy Service**: Handles all folder-related functionalities, including CRUD operations for folders and subfolders.
- **Version Service**: Manages documents and their versions, storing them securely in the database and ensuring that previous versions are always accessible.

---

## 🗃️ Database Structure

MongoDB is used for data persistence. Each service maintains its db and schema to manage specific data:

- **User Schema**: Stores user credentials, profile data.
- **Folder Schema**: Represents folders with optional parent-child relationships (recursive structure) and the path.
- **Document Schema**: Contains document metadata with references to the associated folders.
- **Document Schema**:  Contains version metadata with references to the associated document.

**Folder has many documents have many version**

---

## 🔐 Authentication

JWT-based authentication is used to secure API endpoints. Users must authenticate in order to access folder and document management functionality.

---

## 🛠️ Error Handling and Logging

- HTTP status codes are used appropriately for success and error cases.
- Logging is implemented using **Winston** to track API requests, errors, and critical events for debugging and monitoring.
