# EduQuery.ai 

EduQuery.ai is an intelligent full-stack web application designed to assist users in extracting and querying insights from PDF documents such as resumes or academic reports using LLM (Large Language Model) powered backends.

---

##  Features

-  PDF Upload Functionality
-  Embedding & Storage using Vector Databases
-  Intelligent Chat Interface to Query Uploaded Content
-  RESTful API Backend with Express.js
-  Integration with Gemini LLMs
-  LangChain RAG support (Retrieval-Augmented Generation)

---

##  Project Structure

```
EduQuery.ai/
│
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── utils/
│ ├── config/
│
├── frontend/
│ ├── upload.html
│ └── chat.html
| └── static/logo.png
│
├── uploads/ (stores uploaded PDF files)
├── index.js (Express.js main server file)
├── .env
├── package.json
└── README.md

```


---

##  Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **LLM Integration:** Gemini open source model (via API)
- **PDF Processing:** `pdf-parse`
- **Embedding Logic:** LangChain JS

---

## Upload and Query Chat page

<img width="1885" height="865" alt="image" src="https://github.com/user-attachments/assets/db2c4140-81e1-440b-b19b-92245774541f" />

<img width="1910" height="885" alt="image" src="https://github.com/user-attachments/assets/7db26e49-1614-4039-8b8b-956c47ff528e" />



##  Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/arthisri14/EduQuery.ai.git
cd EduQuery.ai
```
### 2. Install Dependencies

```bash
npm install
```
### 3. Create .env File

```bash
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_HOST=localhost
```

### 4. Run the App

```bash
node index.js
```
App will run at: http://localhost:5000

### 5: Set Up the MySQL Database

Run the following SQL commands in your MySQL client to create the necessary database and tables for **EduQuery.ai**:

<details>
<summary>Click to expand SQL setup code</summary>

<br>

```sql
-- Create the database
CREATE DATABASE eduquery;

-- Switch to the database
USE eduquery;

-- Create documents table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    embedding TEXT
);

-- Create embeddings table
CREATE TABLE embeddings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    chunk TEXT,
    embedding TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

</details>

```


##  Usage Flow

 - Go to /upload — Upload a PDF file (e.g., resume, report).
 - The file is processed, vectorized, and stored.
 - Redirects to /chat — Chat interface opens.
 - Ask any query related to the uploaded content. The app uses LLM + vector search for context-aware answers.

