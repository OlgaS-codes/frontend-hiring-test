import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

interface MyContext {}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  MessagesCursor: any;
};

export type Message = {
  __typename?: "Message";
  id: Scalars["ID"];
  status: MessageStatus;
  text: Scalars["String"];
  updatedAt: Scalars["String"];
  sender: MessageSender;
};

export type MessageEdge = {
  __typename?: "MessageEdge";
  cursor: Scalars["MessagesCursor"];
  node: Message;
};

export type MessagePage = {
  __typename?: "MessagePage";
  edges: Array<MessageEdge>;
  pageInfo: MessagePageInfo;
};

export type MessagePageInfo = {
  __typename?: "MessagePageInfo";
  endCursor?: Maybe<Scalars["MessagesCursor"]>;
  hasNextPage: Scalars["Boolean"];
  hasPreviousPage: Scalars["Boolean"];
  startCursor?: Maybe<Scalars["MessagesCursor"]>;
};

export enum MessageStatus {
  Read = "Read",
  Sending = "Sending",
  Sent = "Sent",
}

export enum MessageSender {
  Admin = "Admin",
  Customer = "Customer",
}

export type Mutation = {
  __typename?: "Mutation";
  sendMessage: Message;
};

export type MutationSendMessageArgs = {
  text: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  messages: MessagePage;
};

export type QueryMessagesArgs = {
  after?: InputMaybe<Scalars["MessagesCursor"]>;
  before?: InputMaybe<Scalars["MessagesCursor"]>;
  first?: InputMaybe<Scalars["Int"]>;
};

export type Subscription = {
  __typename?: "Subscription";
  messageAdded: Message;
  messageUpdated: Message;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Message: ResolverTypeWrapper<Message>;
  MessageEdge: ResolverTypeWrapper<MessageEdge>;
  MessagePage: ResolverTypeWrapper<MessagePage>;
  MessagePageInfo: ResolverTypeWrapper<MessagePageInfo>;
  MessageStatus: MessageStatus;
  MessagesCursor: ResolverTypeWrapper<Scalars["MessagesCursor"]>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  Subscription: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"];
  ID: Scalars["ID"];
  Int: Scalars["Int"];
  Message: Message;
  MessageEdge: MessageEdge;
  MessagePage: MessagePage;
  MessagePageInfo: MessagePageInfo;
  MessagesCursor: Scalars["MessagesCursor"];
  Mutation: {};
  Query: {};
  String: Scalars["String"];
  Subscription: {};
}>;

export type MessageResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["Message"] = ResolversParentTypes["Message"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  status?: Resolver<ResolversTypes["MessageStatus"], ParentType, ContextType>;
  text?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageEdgeResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["MessageEdge"] = ResolversParentTypes["MessageEdge"]
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes["MessagesCursor"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Message"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessagePageResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["MessagePage"] = ResolversParentTypes["MessagePage"]
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes["MessageEdge"]>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<
    ResolversTypes["MessagePageInfo"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessagePageInfoResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["MessagePageInfo"] = ResolversParentTypes["MessagePageInfo"]
> = ResolversObject<{
  endCursor?: Resolver<
    Maybe<ResolversTypes["MessagesCursor"]>,
    ParentType,
    ContextType
  >;
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  startCursor?: Resolver<
    Maybe<ResolversTypes["MessagesCursor"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface MessagesCursorScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["MessagesCursor"], any> {
  name: "MessagesCursor";
}

export type MutationResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = ResolversObject<{
  sendMessage?: Resolver<
    ResolversTypes["Message"],
    ParentType,
    ContextType,
    RequireFields<MutationSendMessageArgs, "text">
  >;
}>;

export type QueryResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = ResolversObject<{
  messages?: Resolver<
    ResolversTypes["MessagePage"],
    ParentType,
    ContextType,
    Partial<QueryMessagesArgs>
  >;
}>;

export type SubscriptionResolvers<
  ContextType = MyContext,
  ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]
> = ResolversObject<{
  messageAdded?: SubscriptionResolver<
    ResolversTypes["Message"],
    "messageAdded",
    ParentType,
    ContextType
  >;
  messageUpdated?: SubscriptionResolver<
    ResolversTypes["Message"],
    "messageUpdated",
    ParentType,
    ContextType
  >;
}>;

export type Resolvers<ContextType = MyContext> = ResolversObject<{
  Message?: MessageResolvers<ContextType>;
  MessageEdge?: MessageEdgeResolvers<ContextType>;
  MessagePage?: MessagePageResolvers<ContextType>;
  MessagePageInfo?: MessagePageInfoResolvers<ContextType>;
  MessagesCursor?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;
