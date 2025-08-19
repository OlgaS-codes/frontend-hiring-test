import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Chat } from "./chat.tsx";
import { ApolloProvider } from "@apollo/client";
import { client } from "./graphql/client.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <Chat />
    </ApolloProvider>
  </StrictMode>
);
