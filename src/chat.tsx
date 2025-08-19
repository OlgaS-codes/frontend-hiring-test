import React from "react";
import { ItemContent, Virtuoso } from "react-virtuoso";
import cn from "clsx";
import {
  MessageSender,
  MessageStatus,
  type Message,
} from "../__generated__/resolvers-types";
import css from "./chat.module.css";

const temp_data: Message[] = Array.from(Array(30), (_, index) => ({
  id: String(index),
  text: `Message number ${index}`,
  status: MessageStatus.Read,
  updatedAt: new Date().toISOString(),
  sender: index % 2 ? MessageSender.Admin : MessageSender.Customer,
}));

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

export const Chat: React.FC = () => {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso className={css.list} data={temp_data} itemContent={getItem} />
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
