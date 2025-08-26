import React from "react";
import { ItemContent, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import cn from "clsx";
import { useApolloClient, type ApolloClient } from "@apollo/client";
import {
  MessageSender,
  type Message,
  type MessageEdge,
  type Query,
  type MessagePageInfo,
} from "../__generated__/resolvers-types";

import { GET_LAST_MESSAGES } from "./chat.graphql";
import css from "./chat.module.css";

const MESSAGES_AMOUNT = 10;
const ID_CURSOR_STEP = MESSAGES_AMOUNT + 1; // +1 because of indexsations start from 0
const START_INDEX = 100;

type PageInfoType = {
  startCursor?: string | null;
  endCursor?: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

// const temp_data: Message[] = Array.from(Array(30), (_, index) => ({
//   id: String(index),
//   text: `Message number ${index}`,
//   status: MessageStatus.Read,
//   updatedAt: new Date().toISOString(),
//   sender: index % 2 ? MessageSender.Admin : MessageSender.Customer,
// }));

const Item: React.FC<Message> = ({ text, sender, id }) => {
  return (
    <div className={css.item}>
      <div
        className={cn(
          css.message,
          sender === MessageSender.Admin ? css.out : css.in
        )}
      >
        {id}: {text}
      </div>
    </div>
  );
};

const getItem: ItemContent<Message, unknown> = (_, data) => {
  return <Item {...data} />;
};

export const Chat: React.FC = () => {
  const client = useApolloClient();
  const [loading, setLoading] = React.useState(true);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [pageInfo, setPageInfo] = React.useState<PageInfoType>({
    startCursor: null,
    endCursor: null,
    hasPreviousPage: true,
    hasNextPage: true,
  });
  const [error, setError] = React.useState<unknown | null>(null);
  const [loadingPreviousPage, setLoadingPreviousPage] = React.useState(false);
  const [firstItemIndex, setFirstItemIndex] = React.useState(
    START_INDEX - messages.length
  );
  const fetchLastPage = async (
    client: ApolloClient<object>,
    count = MESSAGES_AMOUNT
  ) => {
    let edges: MessageEdge[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage) {
      const { data }: { data: Query } = await client.query({
        query: GET_LAST_MESSAGES,
        variables: { first: MESSAGES_AMOUNT, after },
        fetchPolicy: "network-only",
      });

      edges = [...edges, ...data.messages.edges];

      const pageInfo: MessagePageInfo = data.messages.pageInfo;

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    }

    const lastEdges = edges.slice(-count);
    const pageInfo = lastEdges.length
      ? {
          startCursor: lastEdges[0].cursor,
          endCursor: lastEdges[lastEdges.length - 1].cursor,
          hasPreviousPage: edges.length > count,
          hasNextPage: false,
        }
      : {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        };

    console.log({ pageInfo });
    console.log({ lastEdges });
    return {
      messages: lastEdges.map(({ node }) => ({
        id: String(node.id),
        text: node.text,
        status: node.status,
        updatedAt: node.updatedAt,
        sender: node.sender,
      })),
      pageInfo,
    };
  };

  const fetchPreviousPage = async () => {
    console.log("call fetch previous 10 messages");

    if (!pageInfo.hasPreviousPage) {
      console.log("No more messages in a history");
      return;
    }

    try {
      setLoadingPreviousPage(true);

      const previousCursor = String(
        Number(pageInfo.startCursor) - ID_CURSOR_STEP
      );

      const { data }: { data: Query } = await client.query({
        query: GET_LAST_MESSAGES,
        variables: { first: MESSAGES_AMOUNT, after: previousCursor },
        fetchPolicy: "network-only",
      });

      const previosMessages = data.messages.edges.map(({ node }) => ({
        id: String(node.id),
        text: node.text,
        status: node.status,
        updatedAt: node.updatedAt,
        sender: node.sender,
      }));
      setMessages((prev) => [...previosMessages, ...prev]);
      setPageInfo(data.messages.pageInfo);
      const nextFirstItemIndex = START_INDEX - messages.length;
      setFirstItemIndex(nextFirstItemIndex);

      console.log("fetchPreviousPage", { data });
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const loadLast = async () => {
      try {
        setLoading(true);
        const { messages: lastMsgs, pageInfo } = await fetchLastPage(
          client,
          10
        );
        setMessages(lastMsgs);
        setPageInfo(pageInfo);
      } catch (err) {
        setError(err);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLast();
  }, [client]);

  console.log({ messages });

  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso
          className={css.list}
          data={messages}
          itemContent={getItem}
          startReached={fetchPreviousPage}
          followOutput="auto"
          initialTopMostItemIndex={messages.length - 1}
          firstItemIndex={Math.max(0, firstItemIndex)} // !!!
        />
      </div>
      <div className={css.footer}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
        />
        <button>Send</button>
      </div>
    </div>
  );
};
