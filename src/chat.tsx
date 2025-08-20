import React from "react";
import { ItemContent, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import cn from "clsx";
import {  type ApolloClient, useApolloClient, useMutation, useSubscription} from '@apollo/client';
import { loadDevMessages } from "@apollo/client/dev";
import { GET_LAST_MESSAGES, SEND_MESSAGE, NEW_MESSAGE } from './chat.graphql'
import {
  MessageSender,
  type Message,
	type MessageEdge,
	type Query
} from "../__generated__/resolvers-types";
import css from "./chat.module.css";


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

    
  }

	return allMessages.slice(-count);
}

export const Chat: React.FC = () => {


	const client = useApolloClient();
	const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown | null>(null);
	const [text, setText] = React.useState('');
	const [loadingMoreOldMessages, setLoadingMoreOldMessages] = React.useState(false);
	const [hasMoreOldMessages, setHasMoreOldMessages] = React.useState(true);
	const virtuosoRef = React.useRef<VirtuosoHandle>(null);

	const onSendMessage = () => {
		
		sendMessage({variables: { 
      text: text
		}})
		setText("");
	}
	const [sendMessage, { data, loading: sendMessageLoading, error: sendMessageError }] = useMutation(SEND_MESSAGE, {
 
    update(cache, { data: { sendMessage } }) {
			const data = cache.readQuery({ query: GET_LAST_MESSAGES, variables: { first: 10, after: null } });
		
			if (!data) return;
		
			cache.writeQuery({
				query: GET_LAST_MESSAGES,
				variables: { first: 10, after: null },
				data: {
					messages: {
						...data.messages,
						edges: [
							...data.messages.edges,
							{
								__typename: "MessageEdge",
								cursor: sendMessage.id, 
								node: sendMessage,
							},
						],
					},
				},
			});
		}		
  });

  useSubscription(NEW_MESSAGE, {
    onData: ({ data }) => {
      const newMessage = data.data?.messageAdded;
      if (!newMessage) return;
      setMessages(prev => [...prev, newMessage]);

			
    },
  });
 
	loadDevMessages();// TODO: remove
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
	}, [client])


	const getOldMessages = async () => {
		if (!hasMoreOldMessages || loadingMoreOldMessages) return;
	
		setLoadingMoreOldMessages(true);
		try {
			const firstMessage = messages[0];
			const beforeCursor = firstMessage?.id || null;
	
		

			const { data }: { data: Query } = await client.query({
				query: GET_LAST_MESSAGES,
				variables: { first: 10, before: beforeCursor },
				fetchPolicy: 'network-only',
			});
	
			const newMessages: Message[] = data.messages.edges.map(({ node }) => ({
				id: String(node.id),
				text: node.text,
				status: node.status,
				updatedAt: node.updatedAt,
				sender: node.sender,
			}));
			
			setMessages(prev => [...newMessages, ...prev]);	
			setHasMoreOldMessages(data.messages.pageInfo.hasPreviousPage);

		} catch (err) {
			console.error(err);
		} finally {
			setLoadingMoreOldMessages(false);
		}
	};

	const firstItemIndex = React.useMemo(() => 1000 - messages.length, [messages.length]);


	if (error) {
    console.log(JSON.stringify(error, null, 2));
    return null;
  }

	if (loading) return <p>Loading...</p>;

	
  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso 
				followOutput="auto"
				className={css.list} 
				data={messages} 
				itemContent={getItem} 
				ref={virtuosoRef} 
				firstItemIndex={firstItemIndex}
				initialTopMostItemIndex={messages.length - 1} 
				startReached={getOldMessages}
				/>
      </div>
      <div className={css.footer}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
					value={text}
					onChange={e => setText(e.target.value)}
          
        />
        <button onClick={()=>{onSendMessage()}}>Send</button>
      </div>
    </div>
  );
};
