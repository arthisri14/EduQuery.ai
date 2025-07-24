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

##  Usage Flow

 - Go to /upload — Upload a PDF file (e.g., resume, report).
 - The file is processed, vectorized, and stored.
 - Redirects to /chat — Chat interface opens.
 - Ask any query related to the uploaded content. The app uses LLM + vector search for context-aware answers.

