import React, { useState, useEffect, useCallback, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Box from "@mui/material/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@mui/icons-material/Add";
import MailIcon from "@mui/icons-material/Mail";
import FeedIcon from "@mui/icons-material/Feed";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import Fab from "@material-ui/core/Fab";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useRouter } from "next/router";
import { setName, setToken } from "../redux/auth";
import { useDispatch } from "react-redux";
import AddFriendDialog from "../components/AddFriendDialog";
import { Conversation, Friend, FriendRequest, Message } from "../api/types";
import FriendList from "../components/FriendList";
import { friendsDB, updateUnreadFriendRequestsCounts, conversationsDB } from "../api/db";
import { useWebsocketListener } from "../api/websocket";
import FriendRequestDialog from "../components/FriendRequestDialog";
const { useRequest } = require("ahooks");
import { findFriend, addFriend, deleteFriend, addFriendTag, getTagFriends } from "../api/friend";
import CustomInput from "../components/CustomInput";
import SelectFriendTagDialog from "../components/SelectTagDialog";
import { addConversation, addMessage, getConversation } from "../api/chat";
import MessageBubble from "../components/MessageBubble";
import ConversationList from "../components/ConversationList";
import ChatHistoryDialog from "../components/ChatHistoryDialog";

const Chatroom = () => {
  const [showChats, setShowChats] = useState(true);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [friendNichname, setFriendNichname] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [friendRequestList, setFriendRequestList] = useState<FriendRequest[]>([]);
  const [unreadFriendRequestsCount, setUnreadFriendRequestsCount] = useState(0);
  const [friendRequestOpen, setFriendRequestOpen] = useState(false);
  const [friendChange, setFriendChange] = useState(false);
  const [friendRequestChange, setFriendRequestChange] = useState(false);
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [friendTag, setFriendTag] = useState("");
  const [tagFriend, setTagFriend] = useState("");
  const [showSelectTag, setShowSelectTag] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [useTag, setUseTag] = useState(false);
  const [tagFriendList, setTagFriendList] = useState<Friend[]>([]);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [activateConversationId, setActivateConversationId] = useState<number>(-1);
  const [conversationChange, setConversationChange] = useState(false);
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState<{ [key: number]: number }>({});
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [activateConversationType, setActivateConversationType] = useState<number>(0);
  const [authEmail, setAuthEmail] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState<Message>({id: -1, conversation: -1, sender: "", content: "", timestamp: "", read: [], reply_to: -1, reply_by: -1});
  const [totalUnreadCounts, setTotalUnreadCounts] = useState<number>(0);
  const [initialRender, setInitialRender] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();
  const authUserName = useSelector((state: RootState) => state.auth.name);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const cookie_jwtToken = Cookies.get("jwt_token");
    if (!cookie_jwtToken) {
      router.push(`/SignIn`);
    }
    else {
      if (authUserName === undefined || authUserName === "") {
        const header = new Headers();
        header.append("authorization", cookie_jwtToken);
        fetch(`/api/chat/get_userinfo`, {
          method: "GET",
          headers: header,
        })
        .then((res) => res.json())
        .then((res) => {
          if (Number(res.code) === 0) {
            dispatch(setToken(cookie_jwtToken));
            dispatch(setName(res.userinfo.username));
            setAuthEmail(res.userinfo.email);
          }
          else {
            alert(res.info);
          }
        })
        .catch(() => {
          alert("Please sign in again.");
          Cookies.remove("jwt_token");
          router.push(`/SignIn`);
        });
      }
    }
  }, [authUserName, dispatch, router]);

  const handleClick = () => {
    router.push({
      pathname: "/Profile"
    });
  };

  // showChats and showFriends

  const ShowChats = () => {
    setShowChats(true);
  };

  const ShowFriends = () => {
    setShowChats(false);
    setUseTag(false);
    setFriendChange(!friendChange);
  };

  // AddFriendDialog

  const handleClickAddFriendOpen = () => {
    setAddFriendOpen(true);
  };

  const handleAddFriendClose = () => {
    setAddFriendOpen(false);
    setFriendUsername("");
    setFriendNichname("");
    setFriendPhone("");
    setFriendEmail("");
    setShowInfo(false);
  };

  const handleFindFriend = () => {
    if (friendUsername === "") {
      alert("Please enter a username.");
      return;
    }
    findFriend(friendUsername)
      .then((res) => res.json())
      .then((res) => {
        if (Number(res.code) === 0) {
          setFriendNichname(res.userinfo.nickname);
          setFriendPhone(res.userinfo.phone);
          setFriendEmail(res.userinfo.email);
          setShowInfo(true);
        }
        else {
          alert(res.info);
        }
      })
      .catch((error) => {
        alert(error.info);
      });
  };

  const handleSubmitFriendRequest = () => {
    if (friendUsername === "") {
      alert("Please enter a username.");
      return;
    }
    addFriend(friendUsername)
    .then((res) => res.json())
    .then((res) => {
      if (Number(res.code) === 0) {
        alert(`Friend request sent to ${friendUsername}.`);
        setAddFriendOpen(false);
        setFriendUsername("");
        setFriendNichname("");
        setFriendPhone("");
        setFriendEmail("");
        setShowInfo(false);
      }
      else {
        alert(res.info);
      }
    })
    .catch((error) => {
      alert(error.info);
    });
  };

  // FriendRequest

  const handleClickFriendRequestOpen = async () => {
    setFriendRequestChange(!friendRequestChange);
    setFriendRequestOpen(true);
  };

  const handleFriendRequestClose = () => {
    setFriendRequestOpen(false);
    setFriendRequestChange(!friendRequestChange);
  };

  const { refresh: friendRequestsRefresh } = useRequest(async () => {
    const friendRequests = await friendsDB.friendRequests.toArray();
    return friendRequests;
  });

  const updateFriendRequest = useCallback(() => {
    friendsDB.pullFriendRequests()
      .then((count) => {
        setUnreadFriendRequestsCount(count);
        friendRequestsRefresh();
      });
  }, [friendRequestsRefresh]);

  useWebsocketListener(updateFriendRequest, 0);

  const { refresh: friendsRefresh } = useRequest(async () => {
    const friends = await friendsDB.friends.toArray();
    return friends;
  });

  const updateNewFriend = useCallback((friendname?: string) => {
    const temp_friend: Friend = {username: "", email: "", tag: ""};
    if (friendname) {
      findFriend(friendname)
        .then((res) => res.json())
        .then((res) => {
          if (Number(res.code) === 0) {
            temp_friend.username = res.userinfo.username;
            temp_friend.email = res.userinfo.email;
            temp_friend.tag = "";
            setFriendChange(!friendChange);
          }
          else {
            alert(res.info);
          }
        })
        .catch((error) => {
          alert(error.info);
        });
    }
    friendsDB.friends.bulkPut([temp_friend])
      .then(() => {
        friendsRefresh();
      });
    setFriendsList([...friendsList, temp_friend]);
  }, [friendsRefresh]);

  useWebsocketListener(updateNewFriend, 1);

  useEffect(() => {
    friendsDB.pullFriendRequests();
  }, [friendRequestChange]);

  useEffect(() => {
    setTimeout(() => {
      friendsDB.friendRequests.toArray().then((friendRequests) => {
        setFriendRequestList(friendRequests);
        const count = updateUnreadFriendRequestsCounts(friendRequests);
        setUnreadFriendRequestsCount(count);
      });
    }, 200);
  }, [friendRequestChange]);

  // FriendList

  const handleDeleteFriend = (username: string) => {
    deleteFriend(username)
    .then((res) => res.json())
    .then((res) => {
      if (Number(res.code) === 0) {
        alert("You have deleted the friend.");
        setFriendChange(!friendChange);
      }
      else {
        alert(res.info);
      }
    })
    .catch((error) => {
      alert(error.info);
    });
  };

  const handleClickAddFriendTagOpen = (username: string) => {
    setAddTagOpen(true);
    setTagFriend(username);
  };

  const handleClickAddFriendTagClose = () => {
    setTagFriend("");
    setFriendTag("");
    setAddTagOpen(false);
  };

  const handleAddFriendTag = () => {
    if (tagFriend === "") {
      alert("Please enter a tag.");
      return;
    }
    addFriendTag(tagFriend, friendTag)
    .then((res) => res.json())
    .then((res) => {
      if (Number(res.code) === 0) {
        alert(`You have Added tag "${friendTag}" to the friend.`);
        setTagFriend("");
        setFriendTag("");
        setFriendChange(!friendChange);
        setAddTagOpen(false);
      }
      else {
        alert(res.info);
      }
    })
    .catch((error) => {
      alert(error.info);
    });
  };

  useEffect(() => {
    friendsDB.pullFriends();
  }, [friendChange]);

  useEffect(() => {
    setTimeout(() => {
      friendsDB.friends.toArray().then((friends) => {
        setFriendsList(friends);
        const friendTags: string[] = [];
        friends.forEach((friend) => {
          if (friend.tag !== "" && !friendTags.includes(friend.tag)) {
            friendTags.push(friend.tag);
          }
        });
        setTags(friendTags);
      });
    }, 200);
  }, [friendChange]);

  const handleFriendtoChat = (friendname: string) => {
    conversationsDB.conversations
      .filter(conversation => {
        return conversation.members.length === 2 &&
          conversation.members.includes(authUserName) &&
          conversation.members.includes(friendname);
      })
      .toArray()
      .then(conversation => {
        setActivateConversationId(conversation[0].id);
        setShowChats(true);
      })
      .catch(error => {
        alert(error.info);
      });
  };

  // selectTagFriendDialog

  const handleSelechTagOpen = () => {
    setShowSelectTag(true);
  };

  const handleSelechTagClose = () => {
    setShowSelectTag(false);
  };

  const handleGetTagFriends = (tag: string) => {
    getTagFriends(tag)
    .then((res) => res.json())
    .then((res) => {
      if (Number(res.code) === 0) {
        setTagFriendList(res.friends);
        setUseTag(true);
        setShowSelectTag(false);
      }
      else {
        alert(res.info);
      }
    })
    .catch((error) => {
      alert(error.info);
    });
  };

  // MessageSent

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const addNewMessage = (newMessage: Message) => {
    const conversationId = newMessage.conversation;
    conversationsDB.addNewMessage(conversationId, newMessage).then((messageList) => {
      setMessageList(messageList);
    });
  };

  const handleSend = async () => {
    if (message.trim()) {
      if (isReply) {
        try {
          const finalReplyMessage = "Reply to Message [" + replyMessage.content + "]\n-------------------------\n" + message;
          const res = await addMessage(activateConversationId, finalReplyMessage, replyMessage.id);
          const data = await res.json();
          if (Number(data.code) === 0) {
            const newMessage: Message = data.message;
            addNewMessage(newMessage);
            setMessage("");
            const conversation = await conversationsDB.conversations.get(activateConversationId);
            if (conversation) {
              await conversationsDB.conversations.delete(activateConversationId);
              const conversations = await conversationsDB.conversations.toArray();
              conversations.unshift(conversation);
              setConversationList(conversations);
              if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
              }
              await conversationsDB.conversations.bulkPut(conversations);
            }
          }
          else {
            alert(data.info);
          }
        }
        catch (error: any) {
          alert(error.info);
        }
        setIsReply(false);
      }
      else {
        try {
          const res = await addMessage(activateConversationId, message, -1);
          const data = await res.json();
          if (Number(data.code) === 0) {
            const newMessage: Message = data.message;
            addNewMessage(newMessage);
            setMessage("");
            const conversation = await conversationsDB.conversations.get(activateConversationId);
            if (conversation) {
              await conversationsDB.conversations.delete(activateConversationId);
              const conversations = await conversationsDB.conversations.toArray();
              conversations.unshift(conversation);
              setConversationList(conversations);
              if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
              }
              await conversationsDB.conversations.bulkPut(conversations);
            }
          }
          else {
            alert(data.info);
          }
        }
        catch (error: any) {
          alert(error.info);
        }
      }
    }
    conversationsDB.sendReadConversation(activateConversationId, authUserName)
      .then((messages) => {
        if (messages) {
          setMessageList(messages);
          setConversationUnreadCounts({...conversationUnreadCounts, [activateConversationId]: 0});
          setTotalUnreadCounts(preTotalUnreadCounts => {
            return preTotalUnreadCounts - conversationUnreadCounts[activateConversationId];
          });
        }
      });
  };

  const { refresh: conversationMessagesRefresh } = useRequest(async () => {
    const conversationMessages = await conversationsDB.conversationMessages.toArray();
    return conversationMessages;
  });

  const updateMessageRequest = useCallback((conversationId?: string) => {
    if (conversationId) {
      conversationsDB.pullNewMessages(parseInt(conversationId))
        .then((count) => {
          setConversationChange(prevConversationChange => {
            return !prevConversationChange;
          });
          conversationsDB.conversationMessages.get(parseInt(conversationId)).then((conversationMessages) => {
            if (conversationMessages) {
              setMessageList(conversationMessages.messages);
            }
          });
          setConversationUnreadCounts(prevCounts => {
            const updatedCounts = { ...prevCounts };
            if (Object.prototype.hasOwnProperty.call(updatedCounts, parseInt(conversationId))) {
              updatedCounts[parseInt(conversationId)] += count;
            }
            else {
              updatedCounts[parseInt(conversationId)] = count;
            }
            return updatedCounts;
          });
          setTotalUnreadCounts(preTotalUnreadCounts => {
            return preTotalUnreadCounts + count;
          });
          conversationMessagesRefresh();
        });
    }
  }, [conversationMessagesRefresh]);

  useWebsocketListener(updateMessageRequest, 3);

  // addNewPrivateConversation

  const handleNewPrivateConversation = (username: string) => {
    addConversation(0, [authUserName, username])
      .then((res) => res.json())
      .then((res) => {
        if (Number(res.code) === 0) {
          const tempConv: Conversation = {id: res.conversation.id, type: res.conversation.type, members: res.conversation.members};
          conversationsDB.addNewConversations(tempConv);
          setConversationChange(prevConversationChange => {
            return !prevConversationChange;
          });
          setActivateConversationId(res.conversation.id);
          addMessage(tempConv.id, "I passed your friend verification request. Now we can start chatting.", -1)
            .then((res) => res.json())
            .then((res) => {
              if (Number(res.code) === 0) {
                const newMessage: Message = res.message;
                addNewMessage(newMessage);
              }
              else {
                alert(res.info);
              }
            })
            .catch((error) => {
              alert(error.info);
            });
        }
        else {
          alert(res.info);
        }
      })
      .catch((error) => {
        alert(error.info);
      });
  };

  // conversationList

  const getActivateConversationTitle = (conversationId: number) => {
    const members = conversationList.filter(conversation => conversation.id === conversationId).at(0)?.members;
    if (members) {
      for (const member of members) {
        if (member !== authUserName) {
          return member;
        }
      }
    }
  };

  const handleChangeActivateConversation = (conversationId: number) => {
    conversationsDB.sendReadConversation(conversationId, authUserName)
      .then((messages) => {
        if (messages) {
          setMessageList(messages);
        }
        setActivateConversationType(getConversationType(conversationId));
        setActivateConversationId(conversationId);
        setConversationUnreadCounts({...conversationUnreadCounts, [conversationId]: 0});
        setTotalUnreadCounts(preTotalUnreadCounts => {
          return preTotalUnreadCounts - conversationUnreadCounts[conversationId];
        });
      });
  };

  const updateConversationRead = useCallback((username?: string, conversationId?: string) => {
    if (username && conversationId) {
      conversationsDB.processReadConversation(parseInt(conversationId), username)
        .then((messages) => {
          if (messages) {
            setMessageList(messages);
          }
          conversationMessagesRefresh();
        });
    }
  }, [conversationMessagesRefresh]);

  useWebsocketListener(updateConversationRead, 2);

  useEffect(() => {
    if (!initialRender) {
      setTimeout(() => {
        conversationsDB.conversationMessages.toArray().then((conversationMessages) => {
          const messageTimestamps = conversationMessages.map((conversationMessage) => {
            const lastMessage = conversationMessage.messages[conversationMessage.messages.length - 1];
            return {
              id: conversationMessage.id,
              timestamp: new Date(lastMessage.timestamp).getTime()
            };
          });
          messageTimestamps.sort((a, b) => b.timestamp - a.timestamp);
          const sortedIds = messageTimestamps.map((item) => item.id);
          conversationsDB.conversations.toArray().then((conversations) => {
            const sortedConversations = sortedIds.map((id) => conversations.find((conversation) => conversation.id === id));
            const filteredConversations = sortedConversations.filter((conversation) => conversation !== undefined) as Conversation[];
            setConversationList(filteredConversations);
          });
        });
      }, 200);
    }
    else {
      setInitialRender(false);
    }
  }, [conversationChange]);

  useEffect(() => {
    conversationsDB.pullWholeConversationMessages().then((conversationUnreadCounts) => {
      setConversationUnreadCounts(conversationUnreadCounts);
      const totalCount = Object.values(conversationUnreadCounts).reduce((total, count) => total + count, 0);
      setTotalUnreadCounts(totalCount);
      conversationsDB.conversationMessages.toArray().then((conversationMessages) => {
        const messageTimestamps = conversationMessages.map((conversationMessage) => {
          const lastMessage = conversationMessage.messages[conversationMessage.messages.length - 1];
          return {
            id: conversationMessage.id,
            timestamp: new Date(lastMessage.timestamp).getTime()
          };
        });
        messageTimestamps.sort((a, b) => b.timestamp - a.timestamp);
        const sortedIds = messageTimestamps.map((item) => item.id);
        conversationsDB.conversations.toArray().then((conversations) => {
          const sortedConversations = sortedIds.map((id) => conversations.find((conversation) => conversation.id === id));
          const filteredConversations = sortedConversations.filter((conversation) => conversation !== undefined) as Conversation[];
          setConversationList(filteredConversations);
        });
      });
    });
  }, []);

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

  // Reply Message

  const handleReplyMessage = (message: Message) =>{
    setIsReply(true);
    setReplyMessage(message);
  };

  const handleCancelReply = () => {
    setIsReply(false);
  };

  // Chat History

  const handleShowChatHistory = () => {
    setShowChatHistory(true);
  };

  const handleChatHistoryClose = () => {
    setShowChatHistory(false);
  };

  const deleteMessage = (messageId: number) => {
    conversationsDB.deleteMessage(activateConversationId, messageId)
      .then((messages) => {
        if (messages) {
          setMessageList(messages);
        }
      });
  };

  // return components

  return (
    <div>
      <Divider />
      <Grid container style={{ width: "100%", height: "97.4vh" }}>
        <Grid item xs={3} style={{ borderRight: "1px solid #e0e0e0", borderLeft: "1px solid #e0e0e0", maxHeight: "97.4vh" }}>
          <Grid container justifyContent="center" alignItems="center" style={{ height: "10vh" }}>
            <Grid item>
              <Box display="inline-block" borderRadius={10} bgcolor="primary.main" p={1} mt={0.8} mb={0.8} style={{ textTransform: "none", padding: "5px 20px"}}>
                <Typography variant="h5" style={{ color: "white", fontWeight: "bold" }}>Capybara Chat</Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider />
          <List>
            <ListItem button onClick={handleClick}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={authUserName}></ListItemText>
            </ListItem>
            <ListItem button onClick={ShowChats}>
              <ListItemIcon>
                <Badge badgeContent={totalUnreadCounts} color="error">
                  <ChatIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Chats"></ListItemText>
            </ListItem>
            <ListItem button onClick={ShowFriends}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Friends"></ListItemText>
              <ListItemSecondaryAction>
                <IconButton aria-label="Selet Tag" onClick={handleSelechTagOpen}>
                  <LocalOfferIcon />
                </IconButton>
                <SelectFriendTagDialog
                  open={showSelectTag}
                  onhandleSelechTagClose={handleSelechTagClose}
                  tags={tags}
                  useTag={useTag}
                  setUseTag={setUseTag}
                  tagFriendList={tagFriendList}
                  onhandleSelectTag={handleGetTagFriends}
                ></SelectFriendTagDialog>
                <IconButton aria-label="Mail" onClick={handleClickFriendRequestOpen}>
                  <Badge badgeContent={unreadFriendRequestsCount} color="error">
                    <MailIcon />
                  </Badge>
                </IconButton>
                <FriendRequestDialog
                  open={friendRequestOpen}
                  onhandleFriendRequestClose={handleFriendRequestClose}
                  friendRequests={friendRequestList}
                  onSetFriendChange={setFriendChange}
                  friendChange={friendChange}
                  onSetFriendRequestChange={setFriendRequestChange}
                  friendRequestChange={friendRequestChange}
                  onhandleNewPrivateConversation={handleNewPrivateConversation}
                ></FriendRequestDialog>
                <IconButton edge="end" aria-label="add" onClick={handleClickAddFriendOpen}>
                  <AddIcon />
                </IconButton>
                <AddFriendDialog
                  open={addFriendOpen}
                  friendUsername={friendUsername}
                  setFriendUsername={setFriendUsername}
                  friendNichname={friendNichname}
                  friendPhone={friendPhone}
                  friendEmail={friendEmail}
                  showInfo={showInfo}
                  onhandleAddFriendClose={handleAddFriendClose}
                  onhandleFindFriend={handleFindFriend}
                  onhandleSubmitFriendRequest={handleSubmitFriendRequest}
                ></AddFriendDialog>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          <Divider />
          <Grid item xs={12} style={{ maxHeight: "64.2vh", overflowY: "auto" }}>
            <List>
              {showChats ? (
                <ConversationList
                  conversations={conversationList}
                  authUserName={authUserName}
                  authEmail={authEmail}
                  messages={messageList}
                  onhandleChangeActivateConversation={handleChangeActivateConversation}
                  activateConversationId={activateConversationId}
                  conversationUnreadCounts={conversationUnreadCounts}
                ></ConversationList>
              ) : (
                <FriendList
                  friends={useTag ? tagFriendList : friendsList}
                  onDeleteFriend={handleDeleteFriend}
                  addTagOpen={addTagOpen}
                  setAddTagOpen={setAddTagOpen}
                  friendTag={friendTag}
                  setFriendTag={setFriendTag}
                  tagFriend={tagFriend}
                  setTagFriend={setTagFriend}
                  onhandleClickAddFriendTagOpen={handleClickAddFriendTagOpen}
                  onhandleClickAddFriendTagClose={handleClickAddFriendTagClose}
                  onhandleAddFriendTag={handleAddFriendTag}
                  onhandleFriendtoChat={handleFriendtoChat}
                ></FriendList>
              )}
            </List>
          </Grid>
        </Grid>
          {activateConversationId === -1 ? (
            <Grid item xs={9}></Grid>
          ) : (
            <Grid item xs={9}>
              <Grid container style={{ height: "10vh", display: "flex", alignItems: "center" }}>
                <Typography variant="h5" style={{ marginLeft: "25px"}}>
                  {getActivateConversationTitle(activateConversationId)}
                </Typography>
              </Grid>
              <Divider/>
              <List ref={listRef} style={{ borderRight: "1px solid #e0e0e0", height: "72.4vh", overflowY: "auto"}}>
                <MessageBubble
                  listRef={listRef}
                  messages={messageList}
                  conversations={conversationList}
                  authUserName={authUserName}
                  authEmail={authEmail}
                  activateConversationId={activateConversationId}
                  activateConversationType={activateConversationType}
                  onhandleReplyMessage={handleReplyMessage}
                  onhandleDeleteMessage={deleteMessage}
                ></MessageBubble>
                {/* Display messages based on selected chat/friend */}
              </List>
              <Divider />
              <Grid container style={{ borderRight: "1px solid #e0e0e0", padding: "10px"}}>
                <Grid container xs={1}>
                  <Grid item style={{ marginLeft: "8px" }}>
                    <IconButton aria-label="Show Chat History" onClick={handleShowChatHistory}>
                      <FeedIcon style={{ fontSize: "2.8rem" }}/>
                    </IconButton>
                    <ChatHistoryDialog
                      open={showChatHistory}
                      onhandleClose={handleChatHistoryClose}
                      messages={messageList}
                      onDeleteMessage={deleteMessage}
                      activateConversationId={activateConversationId}
                      authEmail={authEmail}
                      authUserName={authUserName}
                    ></ChatHistoryDialog>
                  </Grid>
                </Grid>
                <Grid item xs={isReply ? 9 : 10}>
                  <CustomInput
                    label={isReply ? `Reply to Message [${replyMessage.content}]` :   "Type your message here"}
                    value={message}
                    onChange={handleChange}
                    onEnter={handleSend}
                  />
                </Grid>
                {isReply ? (
                  <>
                    <Grid container xs={1} justifyContent="center" alignItems="center">
                      <Grid item style={{ marginLeft: "15px"}}>
                        <IconButton aria-label="Cancel Reply" onClick={handleCancelReply}>
                          <CancelScheduleSendIcon style={{ fontSize: "2rem" }}/>
                        </IconButton>
                      </Grid>
                    </Grid>
                  </>
              ): (null)}
              <Grid xs={1} container justifyContent="center" alignItems="center">
                <Fab tabIndex={0} style={{ width: "54px", height: "54px" }} color="primary" aria-label="send" onClick={handleSend}>
                  <SendIcon />
                </Fab>
              </Grid>
              </Grid>
            </Grid>
          )}
      </Grid>
      <Divider />
    </div>
  );
};

export default Chatroom;