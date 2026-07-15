# API Reference

## Base URLs
- **HTTP API**: `http://<server-host>/api/v1`
- **WebSocket (Socket.io)**: `ws://<server-host>`

---

## HTTP Endpoints

### 1. Health Check
Checks the server health status.

* **URL**: `/health`
* **Method**: `GET`
* **Auth Required**: No
* **Success Response**:
  * **Code**: `200 OK`
  * **Content**:
    ```json
    {
      "message": "ok"
    }
    ```

---

### 2. Authentication

#### Register Organization & Admin
Registers a new organization and creates the first admin user for that organization.

* **URL**: `/auth/register`
* **Method**: `POST`
* **Auth Required**: No
* **Body Parameters**:
  ```json
  {
    "organizationName": "Acme Corp",
    "email": "admin@acme.com",
    "password": "securepassword123"
  }
  ```
* **Success Response**:
  * **Code**: `201 Created`
  * **Content**:
    ```json
    {
      "statusCode": 201,
      "message": "Registration successful",
      "data": {
        "organization": {
          "id": "org_cuid_here",
          "name": "Acme Corp"
        },
        "user": {
          "id": "user_cuid_here",
          "email": "admin@acme.com",
          "role": "ADMIN",
          "createdAt": "2026-07-15T11:41:40.000Z"
        }
      }
    }
    ```

#### Login Agent / Admin
Authenticates a user and sets HTTP-only cookies for Access and Refresh tokens.

* **URL**: `/auth/login`
* **Method**: `POST`
* **Auth Required**: No
* **Body Parameters**:
  ```json
  {
    "email": "admin@acme.com",
    "password": "securepassword123"
  }
  ```
* **Success Response**:
  * **Code**: `200 OK`
  * **Cookies Set**: `accessToken`, `refreshToken`
  * **Content**:
    ```json
    {
      "statusCode": 200,
      "message": "Login successful",
      "data": {
        "organization": {
          "id": "org_cuid_here",
          "name": "Acme Corp"
        },
        "user": {
          "id": "user_cuid_here",
          "email": "admin@acme.com",
          "role": "ADMIN",
          "createdAt": "2026-07-15T11:41:40.000Z"
        }
      }
    }
    ```

#### Logout
Invalidates the current session and clears authorization cookies.

* **URL**: `/auth/logout`
* **Method**: `POST`
* **Auth Required**: Yes (Valid Access Token via cookies or `Authorization` header)
* **Success Response**:
  * **Code**: `200 OK`
  * **Cookies Cleared**: `accessToken`, `refreshToken`
  * **Content**:
    ```json
    {
      "statusCode": 200,
      "message": "Logout successful",
      "data": null
    }
    ```

#### Refresh Access Token
Refreshes the access token using the refresh token (passed via cookie or body).

* **URL**: `/auth/refresh-token`
* **Method**: `GET`
* **Auth Required**: Yes (Valid Refresh Token)
* **Cookies Set/Updated**: `accessToken`, `refreshToken`
* **Success Response**:
  * **Code**: `200 OK`
  * **Content**:
    ```json
    {
      "statusCode": 200,
      "message": "Refresh token successful",
      "data": null
    }
    ```

---

### 3. Visitors

#### Create Visitor
Creates a new anonymous visitor token belonging to an organization.

* **URL**: `/visitor`
* **Method**: `POST`
* **Auth Required**: No (used by the client widget)
* **Body Parameters**:
  ```json
  {
    "organizationId": "org_cuid_here"
  }
  ```
* **Success Response**:
  * **Code**: `201 Created`
  * **Content**:
    ```json
    {
      "statusCode": 201,
      "message": "Visitor created successfully",
      "data": {
        "visitorToken": "uuid-v4-token-string"
      }
    }
    ```

---

### 4. Conversations

#### Create Conversation
Starts a conversation session for a visitor under an organization.

* **URL**: `/conversation`
* **Method**: `POST`
* **Auth Required**: No (uses visitor token authentication)
* **Body Parameters**:
  ```json
  {
    "organizationId": "org_cuid_here",
    "visitorToken": "uuid-v4-token-string"
  }
  ```
* **Success Response**:
  * **Code**: `201 Created`
  * **Content**:
    ```json
    {
      "statusCode": 201,
      "message": "Conversation created successfully",
      "data": {
        "conversationId": "conversation_cuid_here",
        "visitorId": "visitor_cuid_here"
      }
    }
    ```

---

## WebSocket Events

### Connection & Authentication
Clients connect using `socket.io`. Authentication parameters must be supplied in the `auth` object of the socket configuration.

#### Handshake Parameters:
* **Agent Connection**:
  ```javascript
  const socket = io("ws://localhost:PORT", {
    auth: {
      token: "AGENT_ACCESS_TOKEN"
    }
  });
  ```
* **Visitor Connection**:
  ```javascript
  const socket = io("ws://localhost:PORT", {
    auth: {
      visitorToken: "VISITOR_UUID_TOKEN"
    }
  });
  ```

---

### Client to Server (Emit)

#### `join_room`
Requests to join a conversation's room to listen/send messages.
* **Payload**:
  ```json
  {
    "conversationId": "conversation_cuid_here"
  }
  ```

#### `send_message`
Sends a message to a specific conversation room.
* **Payload**:
  ```json
  {
    "conversationId": "conversation_cuid_here",
    "content": "Hello! How can I help you?"
  }
  ```

---

### Server to Client (On)

#### `room_joined`
Fired by the server back to the connecting client acknowledging that the room has been joined.
* **Payload**:
  ```json
  {
    "conversationId": "conversation_cuid_here"
  }
  ```

#### `receive_message`
Fired when a new message is created in the conversation room. Emitted to all clients in the room.
* **Payload**:
  ```json
  {
    "id": "message_cuid_here",
    "conversationId": "conversation_cuid_here",
    "content": "Hello! How can I help you?",
    "senderType": "AGENT", // "AGENT" or "VISITOR"
    "createdAt": "2026-07-15T11:41:40.000Z"
  }
  ```