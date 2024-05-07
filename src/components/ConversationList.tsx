import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemIcon, ListItemText, Avatar } from "@material-ui/core";
import md5 from "md5";
import { Conversation } from "../api/types";
import { findFriend } from "../api/friend";
import Badge from "@material-ui/core/Badge";

export default function ConversationList(props: any) {
  const [avatars, setAvatars] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars: { [key: string]: string } = {};
      for (const message of props.messages) {
        const username = message.sender;
        const hash = await getHash(username);
        if (hash !== null) {
          newAvatars[username] = hash;
        }
      }
      setAvatars(newAvatars);
    };
    fetchAvatars();
  }, [props.messages]);

  const getHash = async (username: string) => {
    try {
      const res = await findFriend(username);
      const data = await res.json();
      if (Number(data.code) === 0) {
        return md5(data.userinfo.email.trim().toLowerCase());
      }
      else {
        alert(data.info);
        return null;
      }
    }
    catch (error: any) {
      alert(error.info);
      return null;
    }
  };

  const activateConversation = props.conversations.find((conversation: Conversation) => conversation.id === props.activateConversationId);

  return (
    <List>
      {props.activateConversationId === props.activateConversationSent ? (
        <>
          <ListItem
            button
            key={props.activateConversationId}
            onClick={() => props.onhandleChangeActivateConversation(props.activateConversationId)}
            disabled={false}
            style={{backgroundColor: "#f0f0f0"}}
          >
            <ListItemIcon>
              <Badge badgeContent={0} color="primary">
                <Avatar
                  alt={activateConversation.members[0] === props.authUserName ? activateConversation.members[1] : activateConversation.members[0]}
                  src={`https://www.gravatar.com/avatar/${avatars[activateConversation.members[0] === props.authUserName ? activateConversation.members[1] : activateConversation.members[0]]}?d=identicon&s=150`}
                />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={activateConversation.members[0] === props.authUserName ? activateConversation.members[1] : activateConversation.members[0]}
              secondary={props.messages.length === 0 ? "" : props.messages[props.messages.length - 1].content}
            />
          </ListItem>
          {props.conversations.map((conversation: Conversation) => (
            <>
              {conversation.type === 0 ? (
                conversation.id !== props.activateConversationId ? (
                  <ListItem
                    button
                    key={conversation.id}
                    onClick={() => props.onhandleChangeActivateConversation(conversation.id)}
                    disabled={props.activateConversationId === conversation.id}
                    style={{ backgroundColor: props.activateConversationId === conversation.id ? "#f0f0f0" : "inherit" }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={props.conversationUnreadCounts[conversation.id]} color="primary">
                        <Avatar
                          alt={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                          src={`https://www.gravatar.com/avatar/${avatars[conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]]}?d=identicon&s=150`}
                        />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                      secondary={props.messages.length === 0 ? "" : props.messages[props.messages.length - 1].content}
                    />
                  </ListItem>
                ) : null
              ) : (
                // 群聊实现
                null
              )}
            </>
          ))}
        </>
      ) : (
        props.conversations.map((conversation: Conversation) => (
          <>
            {conversation.type === 0 ? (
              <ListItem
                button
                key={conversation.id}
                onClick={() => props.onhandleChangeActivateConversation(conversation.id)}
                disabled={props.activateConversationId === conversation.id}
                style={{backgroundColor: props.activateConversationId === conversation.id ? "#f0f0f0" : "inherit"}}
              >
                <ListItemIcon>
                  <Badge badgeContent={props.conversationUnreadCounts[conversation.id]} color="primary">
                    <Avatar
                      alt={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                      src={`https://www.gravatar.com/avatar/${avatars[conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]]}?d=identicon&s=150`}
                    />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={conversation.members[0] === props.authUserName ? conversation.members[1] : conversation.members[0]}
                  secondary={props.messages.length === 0 ? "" : props.messages[props.messages.length - 1].content}
                />
              </ListItem>
            ) : (
              // 群聊实现
              null
            )}
          </>
        ))
      )}
    </List>
  );
}