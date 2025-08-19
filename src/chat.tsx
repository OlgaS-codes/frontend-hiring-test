import React from "react";
import { ItemContent, Virtuoso } from "react-virtuoso";
import cn from "clsx";
import {  type ApolloClient, useApolloClient} from '@apollo/client';
import {GET_LAST_MESSAGES} from './chat.graphql'
import {
  MessageSender,
  type Message,
	type MessageEdge,
	type Query
} from "../__generated__/resolvers-types";
import css from "./chat.module.css";

// const temp_data: Message[] = Array.from(Array(5), (_, index) => ({
//   id: String(index),
//   text: `Message number ${index}`,
//   status: MessageStatus.Read,
//   updatedAt: new Date().toISOString(),
//   sender: index % 2 ? MessageSender.Admin : MessageSender.Customer,
// }));

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


const  getLastMessages = async (client: ApolloClient<object>, count = 10): Promise<Array<MessageEdge> | undefined> => {
  let hasNextPage = true;
  let cursor: string | null = null;
  let allMessages:Array<MessageEdge> = [];

  while (hasNextPage) {
    const { data }: { data: Query }= await client.query<Query>({
      query: GET_LAST_MESSAGES,
      variables: { 
        first: 10, 
        after: cursor 
      }
    });

    allMessages = [...allMessages, ...data.messages.edges];
    hasNextPage = data.messages.pageInfo.hasNextPage;
    cursor = data.messages.pageInfo.endCursor; 
    console.log({data, allMessages, hasNextPage, cursor});
    
  }

	return allMessages.slice(-count);
}

export const Chat: React.FC = () => {


	const client = useApolloClient();
	const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown | null>(null);

 
	React.useEffect(()=>{
		const fetchLastMessages = async () => {
      try {
        setLoading(true);
        const lastMessageEdges = await getLastMessages(client, 10);
         
        const transformedMessages:Array<Message> = lastMessageEdges?.map(({ node }) => ({
          id: String(node.id),
          text: node.text,
          status: node.status,
          updatedAt: node.updatedAt,
          sender: node.sender,
        })) || [];

        setMessages(transformedMessages);
				
      } catch (err) {
        setError(err);
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLastMessages();
	}, 
	[client])

	if (error) {
    console.log(JSON.stringify(error, null, 2));
    return null;
  }

	if (loading) return <p>Loading...</p>;
 console.log({messages});
	
  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso className={css.list} data={messages} itemContent={getItem} />
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
