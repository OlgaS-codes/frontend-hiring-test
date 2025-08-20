import { gql } from '@apollo/client';

export const GET_LAST_MESSAGES = gql`
query GetLastPage($first: Int!, $after: MessagesCursor) {
	messages(first: $first, after: $after) {
		pageInfo {
			hasNextPage
			endCursor
		}
		edges {
			node {
				id
				text
				status
				updatedAt
				sender
			}
			cursor
		}
	}
}
`

export const SEND_MESSAGE = gql`
  mutation sendMessage($text: String!) {
    sendMessage(text: $text) {
      	id
				text
				status
				updatedAt
				sender
				__typename
    }
  }
`;

export const UPDATE_CACHE_FRAGMENT = gql`
	fragment MessageData on Message {
		id
		text
		status
		updatedAt
		sender
		__typename
	}
`

export const MESSAGE_UPDATED = gql`
  subscription OnMessageUpdated {
    messageUpdated {
      id
      text
      status
      updatedAt
      sender
      __typename
    }
  }
`;

export const NEW_MESSAGE = gql`
	  subscription OnMessageAdded {
    messageAdded {
      id
      text
      status
      updatedAt
      sender
      __typename
    }
  }
`