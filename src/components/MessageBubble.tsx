import React, { useEffect, useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Message } from "../api/types";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { CheckCircleOutline, RadioButtonUnchecked } from "@mui/icons-material";
import md5 from "md5";
import { findFriend } from "../api/friend";
import { getConversation } from "../api/chat";

export default function MessageBubble(props: any) {
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
  } catch (error: any) {
    alert(error.info);
    return null;
  }
};

  const getConversationType = (id: number) => {
    let type = 0;
    getConversation(id)
      .then((res) => res.json())
      .then((res) => {
        if (Number(res.code) === 0) {
          type = res.conversations.type;
        }
        else {
          alert(res.info);
        }
      })
      .catch((error) => {
        alert(error.info);
      });
    return type;
  };
    
  return (
    <List>
      {props.messages.map((message: Message) => (
        <ListItem key={message.id}>
          <Grid container justifyContent={message.sender === props.authUserName ? "flex-end" : "flex-start"}>
            {message.sender === props.authUserName ? (
              <>
                <Grid item style={{ maxWidth: "500px", marginRight: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Paper style={{
                      backgroundColor: "#d4edda",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      display: "inline-block",
                    }}>
                      <ListItemText
                        primary={message.content}
                        style={{ textAlign: "left", color: "green"}}
                      />
                    </Paper>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      {/* {getConversationType(message.conversation) === 0 ? ( */}
                      {message.conversation === 0 ? (
                        <div style={{ marginTop: "1px", marginRight: "3px" }}>
                          {message.read && message.read.length > 0 ? <CheckCircleOutline fontSize="small" style={{ color: "green" }} /> : <RadioButtonUnchecked fontSize="small" color="disabled" />}
                        </div>
                      ) : (
                        // 群聊后续实现
                        null
                      )}
                      <Typography variant="caption">{message.timestamp}</Typography>
                    </div>
                  </div>
                </Grid>
                <Avatar
                  alt={message.sender}
                  src={`https://www.gravatar.com/avatar/${avatars[message.sender]}?d=identicon&s=150`}
                  style={{ width: "60px", height: "60px" }}
                />
              </>
            ) : (
              <>
                <Avatar
                  alt={message.sender}
                  src={`https://www.gravatar.com/avatar/${avatars[message.sender]}?d=identicon&s=150`}
                  style={{ width: "60px", height: "60px" }}
                />
                <Grid item style={{ maxWidth: "500px", marginLeft: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Paper style={{
                      backgroundColor: "#f8f9fa",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      display: "inline-block",
                    }}>
                      <ListItemText
                        primary={message.content}
                        style={{ textAlign: "left", color: "black"}}
                      />
                    </Paper>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <Typography variant="caption">{message.timestamp}</Typography>
                      {/* {getConversationType(message.conversation) === 0 ? ( */}
                      {message.conversation === 0 ? (
                        <div style={{ marginTop: "1px", marginLeft: "3px" }}>
                          {message.read && message.read.length > 0 ? <CheckCircleOutline fontSize="small" style={{ color: "green" }} /> : <RadioButtonUnchecked fontSize="small" color="disabled" />}
                        </div>
                      ) : (
                        // 群聊后续实现
                        null
                      )}
                    </div>
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        </ListItem>
      ))}
    </List>
  );
}