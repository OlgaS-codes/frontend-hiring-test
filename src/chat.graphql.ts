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