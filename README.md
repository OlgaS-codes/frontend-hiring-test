# Test Assignment for Frontend Developers

## Overview

This repository contains a test task for frontend developers, specifically focusing on working with **Apollo Client** for managing GraphQL queries, mutations, and subscriptions. The goal of the task is to implement a messaging system where messages are fetched from a server using **pagination** and users can **send new messages** and handle **real-time updates** via **GraphQL subscriptions**.

### Task Breakdown

1. **Replace the `temp_data` variable** on the client-side with a query to fetch messages from the Apollo server. Messages should be fetched with pagination.
2. **Implement message sending** using Apollo Client's `useMutation` hook.
3. Handle **receiving** new messages and updating existing messages through GraphQL subscriptions.

---

## Getting Started

### Step 1: Clone the repository

Clone the repository to your local machine:

```bash
git clone https://github.com/chatfuel-lab/frontend-hiring-test
cd frontend-hiring-test
```

### Step 2: Install Dependencies

Install the required dependencies:

```bash
npm install
```

---

## Running the Project

### 1. Start the Apollo Server (Backend)

```bash
npm run start:server
```

This will start the server on the port (e.g., `http://localhost:4000` and `ws://localhost:4000/graphql`), where the GraphQL API will be available.

### 2. Start the Client (Frontend)

```bash
npm run start:client
```

---

## Submission Guidelines

- Fork this repository and implement the changes as described above.
- Make sure to commit regularly and write clear commit messages explaining your changes.
- After completing the task, contact the repository author or our HR.

---

## Notes

Notes

- Make sure that pagination works correctly with Apollo Client.
- Every second mutation sendMessage returns data with a delay. Ensure that the response from the mutation does not overwrite the data in the cache that has been updated via the subscription. You can check the freshness of the data by the updatedAt field in the message.
- Server-side changes are not required. Your task is to solve all the problems on the client-side.
