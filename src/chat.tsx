import React from "react";
import { ItemContent, Virtuoso } from "react-virtuoso";
import cn from "clsx";
import {
  useApolloClient,
  type ApolloClient,
  useMutation,
  useSubscription,
} from "@apollo/client";

import {
  MessageSender,
  type Message,
  type MessageEdge,
  type Query,
  type MessagePageInfo,
} from "../__generated__/resolvers-types";

import {
  GET_LAST_MESSAGES,
  NEW_MESSAGE_ADDED,
  SEND_MESSAGE,
} from "./chat.graphql";
import css from "./chat.module.css";

const MESSAGES_AMOUNT = 10;
const ID_CURSOR_STEP = MESSAGES_AMOUNT + 1; // +1 because of index starts from 0
const START_INDEX = 100;

type PageInfoType = {
  startCursor?: string | null;
  endCursor?: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const Item: React.FC<Message> = ({ text, sender }) => {
  return (
    <div className={css.item}>
      <div
        className={cn(
          css.message,
          sender === MessageSender.Admin ? css.out : css.in
        )}
      >
        {text}
      </div>
    </div>
  );
};

const getItem: ItemContent<Message, unknown> = (_, data) => {
  return <Item {...data} />;
};

const ChatInput = ({ onSend }: { onSend: (text: string) => void }) => {
  const [text, setText] = React.useState("");
  const onSendMessage = () => {
    onSend(text);
    setText("");
  };

  return (
    <div className={css.footer}>
      <input
        type="text"
        className={css.textInput}
        placeholder="Message text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          onSendMessage();
        }}
      >
        Send
      </button>
    </div>
  );
};

type ChatWindowProps = {
  messages: Message[];
  getItem: ItemContent<Message, unknown>;
  fetchPreviousPage: () => Promise<void>;
  firstItemIndex: number;
};

const ChatWindow = React.memo(
  ({
    messages,
    getItem,
    fetchPreviousPage,
    firstItemIndex,
  }: ChatWindowProps) => (
    <div className={css.container}>
      <Virtuoso
        className={css.list}
        data={messages}
        itemContent={getItem}
        startReached={fetchPreviousPage}
        followOutput="auto"
        initialTopMostItemIndex={messages.length - 1}
        firstItemIndex={Math.max(0, firstItemIndex)}
      />
    </div>
  )
);

export const Chat: React.FC = () => {
  const client = useApolloClient();

  const [loadingMessages, setLoadingMessages] = React.useState(true);
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

  console.log({ firstItemIndex });
  const { data: addedData } = useSubscription(NEW_MESSAGE_ADDED);
  const [text, setText] = React.useState("");
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
    } catch (e) {
      console.error(e);
    }
  };

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    update(cache, { data }) {
      if (!data?.sendMessage) return;

      const newMessage = data.sendMessage;

      cache.modify({
        fields: {
          messages(existingMessages = { edges: [], pageInfo: {} }) {
            const edges = existingMessages.edges || [];

            const existingIndex = edges.findIndex(
              (edge) => edge.node.id === newMessage.id
            );

            if (
              existingIndex >= 0 &&
              edges[existingIndex].node.updatedAt > newMessage.updatedAt
            ) {
              return existingMessages;
            }

            return {
              ...existingMessages,
              edges: [
                ...existingMessages.edges,
                {
                  __typename: "MessageEdge",
                  cursor: newMessage.id,
                  node: newMessage,
                },
              ],
            };
          },
        },
      });
    },
  });

  const onSendMessage = (text: string) => {
    sendMessage({
      variables: {
        text,
      },
    });
  };

  React.useEffect(() => {
    const loadLast = async () => {
      try {
        setLoadingMessages(true);
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
        setLoadingMessages(false);
      }
    };
    loadLast();
  }, [client]);

  React.useEffect(() => {
    if (addedData?.messageAdded) {
      setMessages((prev) => [...prev, addedData.messageAdded]);
    }
  }, [addedData]);

  return (
    <div className={css.root}>
      <ChatWindow
        messages={messages}
        getItem={getItem}
        fetchPreviousPage={fetchPreviousPage}
        firstItemIndex={Math.max(0, firstItemIndex)}
      />
      <ChatInput onSend={onSendMessage} />
    </div>
  );
};
