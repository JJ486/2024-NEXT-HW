import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemIcon, ListItemText, Avatar } from "@material-ui/core";
import md5 from "md5";
import { friendsDB, conversationsDB } from "../api/db";
import Badge from "@material-ui/core/Badge";
import { Friend, Conversation } from "../api/types";

export default function ConversationList(props: any) {
  const [avatars, setAvatars] = useState<{ [key: string]: string }>({});
  const [lastMessage, setLastMessage] = useState<{ [key: number]: string }>({});
  const [lastMessageTime, setLastMessageTime] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars: { [key: string]: string } = {};
      const memberPromises = props.conversations.flatMap((conversation: Conversation) =>
        conversation.members.map(member => getHash(member))
      );
      const hashes = await Promise.all(memberPromises);
      props.conversations.forEach((conversation: Conversation, conversationIndex: number) => {
        conversation.members.forEach((member, memberIndex) => {
          const hash = hashes[conversationIndex * conversation.members.length + memberIndex];
          if (hash !== null) {
            newAvatars[member] = hash;
          }
        });
      });
      setAvatars(newAvatars);
    };
    fetchAvatars();
  }, [props.conversations]);

  const getHash = async (username: string) => {
    return friendsDB.friends.filter(friend => friend.username === username).toArray()
      .then((friend: Friend[]) => {
        if (friend.length > 0) {
          return md5(friend[0].email.trim().toLowerCase());
        }
        else {
          return null;
        }
      });
  };

  useEffect(() => {
    const fetchLastMessage = async () => {
      const newLastMessage: { [key: number]: string } = {};
      const newLastMessageTime: { [key: number]: string } = {};
      const promises = props.conversations.map(async (conversation: Conversation) => {
        const message = await conversationsDB.getMessages(conversation.id);
        if (message) {
          newLastMessage[conversation.id] = message[message.length - 1].content;
          const date = new Date(message[message.length - 1].timestamp);
          newLastMessageTime[conversation.id] = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}`;
        }
      });
      await Promise.all(promises);
      setLastMessage(newLastMessage);
      setLastMessageTime(newLastMessageTime);
    };
    fetchLastMessage();
  }, [props.conversations, props.messages]);

  return (
    <List>
      {props.conversations.map((conversation: Conversation) => (
          <>
            {conversation.type === 0 ? (
              <ListItem
                button
                className="listItem"
                key={conversation.id}
                style={{ backgroundColor: props.activateConversationId === conversation.id ? "#f0f0f0" : "white" }}
                onClick={() => props.onhandleChangeActivateConversation(conversation.id)}
              >
                <ListItemIcon>
                  <Badge badgeContent={props.conversationUnreadCounts[conversation.id]} color="error">
                    <Avatar
                      alt={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                      src={`https://www.gravatar.com/avatar/${avatars[conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]]}?d=identicon&s=150`}
                    />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                  secondary={
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <div style={{ width: "72%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lastMessage[conversation.id]}
                      </div>
                      <div style={{ width: "25%", textAlign: "right", whiteSpace: "nowrap" }}>
                        {lastMessageTime[conversation.id]}
                      </div>
                    </div>
                  }
                />
              </ListItem>
            ) : (
              // 群聊实现
              null
            )}
          </>
        ))}
    </List>
  );
}