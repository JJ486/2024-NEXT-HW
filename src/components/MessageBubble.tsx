import React, { useEffect, useState, useRef } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Message } from "../api/types";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { CheckCircleOutline, RadioButtonUnchecked } from "@mui/icons-material";
import md5 from "md5";
import { friendsDB, conversationsDB } from "../api/db";
import { Conversation, Friend } from "../api/types";

export default function MessageBubble(props: any) {
  const [avatars, setAvatars] = useState<{ [key: string]: string }>({});
  const [username, setUsername] = useState<string[]>([]);
  const [anchorEls, setAnchorEls] = useState<{ [key: number]: HTMLElement | null }>({});
  const paperRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [paperWidths, setPaperWidths] = useState<{ [key: number]: number }>({});

  const handleClick = (event: React.MouseEvent<HTMLElement>, messageId: number) => {
    event.preventDefault();
    setAnchorEls({ [messageId]: event.currentTarget });
  };

  const handleClose = () => {
    setAnchorEls({});
  };

  useEffect(() => {
    setAnchorEls({});
  }, [props.messages]);

  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars: { [key: string]: string } = {};
      const newUsername: string[] = [];
      const conversation = await conversationsDB.conversations
        .filter(conversation => conversation.id === props.activateConversationId)
        .first();
      if (conversation) {
        const memberPromises = conversation.members.map(member => getHash(member));
        const hashes = await Promise.all(memberPromises);
        newAvatars[props.authUserName] = md5(props.authEmail.trim().toLowerCase());
        newUsername.push(props.authUserName);
        conversation.members.forEach((member, index) => {
          const hash = hashes[index];
          if (hash !== null) {
            newAvatars[member] = hash;
            newUsername.push(member);
          }
        });
        setAvatars(newAvatars);
        setUsername(newUsername);
        if (props.listRef.current) {
          props.listRef.current.scrollTop = props.listRef.current.scrollHeight;
        }
      }
    };
    fetchAvatars();
  }, [props.messages]);

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

  const getTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}`;
  };

  useEffect(() => {
    Object.entries(paperRefs.current).forEach(([messageId, paperRef]) => {
      if (paperRef) {
        setPaperWidths((prevWidths) => ({
          ...prevWidths,
          [messageId]: paperRef.clientWidth,
        }));
      }
    });
  }, [paperRefs.current]);

  const locateRepliedMessage = (RepliedMessageId: number) => {
    handleClose();
    const repliedMessageElement = document.getElementById(`message-${RepliedMessageId}`);
    if (repliedMessageElement) {
      props.listRef.current.scrollTop = repliedMessageElement.offsetTop;
    }
  };

  return (
    <List>
      {props.conversations.some((conversation: Conversation) => conversation.id === props.activateConversationId) ? (props.messages.map((message: Message) => (
        <ListItem key={message.id} id={`message-${message.id}`}>
          <Grid container justifyContent={message.sender === props.authUserName ? "flex-end" : "flex-start"}>
            {message.sender === props.authUserName ? (
              <>
                <Grid item style={{ maxWidth: "500px", marginRight: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Paper
                      style={{
                        backgroundColor: "#d4edda",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        display: "inline-block",
                      }}
                      onContextMenu={(event) => handleClick(event, message.id)}
                    >
                      <ListItemText
                        primary={message.content}
                        style={{ textAlign: "left", color: "green", whiteSpace: "pre-wrap" }}
                      />
                    </Paper>
                    <Menu
                      id={`simple-menu-${message.id}`}
                      anchorEl={anchorEls[message.id]}
                      keepMounted
                      open={Boolean(anchorEls[message.id])}
                      onClose={handleClose}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      PaperProps={{
                        style: {
                          width: "fit-content",
                          height: "fit-content",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        },
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: "-10px",
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          props.onhandleReplyMessage(message);
                        }}
                        style={{ textAlign: "center" }}
                      >
                        Reply
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          props.onhandleDeleteMessage(message.id);
                        }}
                        style={{ textAlign: "center" }}
                      >
                        Delete
                      </MenuItem>
                      {message.reply_to !== -1 ? (
                        [
                          <MenuItem
                            key={message.id}
                            onClick={() => {locateRepliedMessage(message.reply_to);}}
                            style={{ textAlign: "center" }}
                          >
                            Locate to Replied Message
                          </MenuItem>
                        ]
                      ) : (null)}
                    </Menu>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      {props.activateConversationType === 0 ? (
                        <div style={{ marginTop: "1px", marginRight: "3px" }}>
                          {message.read.includes(username[0] === props.authUserName ? username[1] : username[0]) ? <CheckCircleOutline fontSize="small" style={{ color: "green" }} /> : <RadioButtonUnchecked fontSize="small" color="disabled" />}
                        </div>
                      ) : (
                        // 群聊后续实现
                        null
                      )}
                      <Typography variant="caption">{getTime(message.timestamp)}</Typography>
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
                    <Paper
                      ref={((ref: HTMLDivElement | null) => (paperRefs.current[message.id] = ref))}
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        display: "inline-block",
                      }}
                      onContextMenu={(event) => handleClick(event, message.id)}
                    >
                      <ListItemText
                        primary={message.content}
                        style={{ textAlign: "left", color: "black", whiteSpace: "pre-wrap" }}>
                      </ListItemText>
                    </Paper>
                    <Menu
                      id={`simple-menu-${message.id}`}
                      anchorEl={anchorEls[message.id]}
                      keepMounted
                      open={Boolean(anchorEls[message.id])}
                      onClose={handleClose}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        style: {
                          width: "fit-content",
                          height: "fit-content",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        },
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: `${paperWidths[message.id] + 10}px`,
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          props.onhandleReplyMessage(message);
                        }}
                        style={{ textAlign: "center" }}
                      >
                        Reply
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          props.onhandleDeleteMessage(message.id);
                        }}
                        style={{ textAlign: "center" }}
                      >
                        Delete
                      </MenuItem>
                      {message.reply_to !== -1 ? (
                        [
                          <MenuItem
                            key={message.id}
                            onClick={() => {locateRepliedMessage(message.reply_to);}}
                            style={{ textAlign: "center" }}
                          >
                            Locate to Replied Message
                          </MenuItem>
                        ]
                      ) : (null)}
                    </Menu>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <Typography variant="caption">{getTime(message.timestamp)}</Typography>
                      {props.activateConversationType === 0 ? (
                        <div style={{ marginTop: "1px", marginLeft: "3px" }}>
                          {message.read.includes(props.authUserName) ? <CheckCircleOutline fontSize="small" style={{ color: "green" }} /> : <RadioButtonUnchecked fontSize="small" color="disabled" />}
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
      ))) : null}
    </List>
  );
}