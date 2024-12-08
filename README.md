# Project Title

## Installation

To install the project, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Banana-Clint/alphacrmAPI
    ```
2. **Navigate to the project directory**.

3. **Install the dependencies**:
    ```bash
    npm install
    ```

4. **Create a `.env` file** with the following variables:
    ```plaintext
    API_URL=http://localhost:
    PORT_NUMBER=3001
    CLIENT_URL=http://localhost:3000 

    # API key for the Gemini API
    GEMINI_API_KEY=YOUR_API_KEY

    # OAuth2 client ID and secret for Google API (Sanitized)
    OAUTH2_API_CLIENT_ID=YOUR_OAUTH2_CLIENT_ID
    OAUTH2_API_CLIENT_SECRET=YOUR_OAUTH2_CLIENT_SECRET

    # Database connection details (Sanitized)
    DB_HOST=127.0.0.1
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=u662656180_test
    ```
4. **Create a `MySQL` Database** with the name=DB_NAME:    

## Running the Project

To start the development server, run the following command:
    ```bash
    node server.js
    ```
## API Endpoints

**Root URL**: `API_URL/Api`

### API Routes

#### Authentication
- `root/Auth/Auth` (GET) - Redirects to the Google OAuth2 Callback Endpoint 

#### Clients
- `root/Client/Clients` (GET) - Returns an array: `[]`
- `root/Client/ClientMetaData` (GET) - Returns:
    ```json
    {
        "client": {},
        "documents": [],
        "events": [],
        "history": [],
        "notes": []
    }
    ```

#### Emails
- `root/EMail/GetInbox` (GET) - Returns an array: `[]`
- `root/EMail/SendEmail` (POST) - Returns an object: `{}`
- `root/EMail/GenerateEmail` (POST) - Returns:
    ```json
    {
        "content": {
            "subject": "",
            "body": ""
        }
    }
    ```
