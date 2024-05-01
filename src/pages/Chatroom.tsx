import React, { useState, useEffect, useCallback, use } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@mui/icons-material/Add";
import MailIcon from "@mui/icons-material/Mail";
import Avatar from "@material-ui/core/Avatar";
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
import { Friend, FriendRequest } from "../api/types";
import FriendList from "../components/FriendList";
import { friendsDB, updateUnreadFriendRequestsCounts } from "../api/db";
import { useFriendListener } from "../api/websocket";
import FriendRequestDialog from "../components/FriendRequestDialog";
const { useRequest } = require("ahooks");
import { addFriend, deleteFriend, addFriendTag, getTagFriends } from "../api/friend";
import CustomInput from "../components/CustomInput";
import SelectFriendTagDialog from "../components/SelectTagDialog";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: "100%",
    height: "93vh"
  },
  headBG: {
    backgroundColor: "#e0e0e0"
  },
  borderRight500: {
    borderRight: "1px solid #e0e0e0"
  },
  messageArea: {
    height: "77vh",
    overflowY: "auto"
  }
});

const Chatroom = () => {
  const classes = useStyles();
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

  const router = useRouter();
  const dispatch = useDispatch();
  const authUserName = useSelector((state: RootState) => state.auth.name);

  const handleClickAddFriendOpen = () => {
    setAddFriendOpen(true);
  };

  const handleSelechTagOpen = () => {
    setShowSelectTag(true);
  };

  const handleClickFriendRequestOpen = async () => {
    setFriendRequestOpen(true);
    await friendsDB.pullFriendRequests();
    try {
      await friendsDB.friendRequests.toArray();
      setFriendRequestChange(!friendRequestChange);
    }
    catch (error: any) {
      console.error(error);
    }
  };

  const handleAddFriendClose = () => {
    setAddFriendOpen(false);
    setFriendUsername("");
    setFriendNichname("");
    setFriendPhone("");
    setFriendEmail("");
    setShowInfo(false);
  };

  const handleFriendRequestClose = () => {
    setFriendRequestOpen(false);
    setFriendRequestChange(!friendRequestChange);
  };

  const handleFindFriend = () => {
    const header = new Headers();
    const jwtToken = Cookies.get("jwt_token");
    if (jwtToken) {
      header.append("authorization", jwtToken);
    }
    else {
      router.push(`/SignIn`);
    }
    if (friendUsername === "") {
      alert("Please enter a username.");
      return;
    }
    fetch(`/api/chat/find_user/${friendUsername}`, {
      method: "GET",
      headers: header,
    })
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

  const handleSelechTagClose = () => {
    setShowSelectTag(false);
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
      alert(error.message);
    });
  };

  const ShowChats = () => {
    setShowChats(true);
  };

  const ShowFriends = () => {
    setShowChats(false);
    setUseTag(false);
  };

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

  const { data: friendRequests, refresh } = useRequest(async () => {
    const friendRequests = await friendsDB.friendRequests.toArray();
    return friendRequests;
  });

  const updateFriendRequest = useCallback(() => {
    friendsDB.pullFriendRequests()
      .then((count) => {
        console.log("count:", count);
        setUnreadFriendRequestsCount(count);
        setFriendChange(!friendChange);
        refresh();
      });
  }, [refresh]);

  useEffect(() => {
    updateFriendRequest();
  }, [updateFriendRequest]);

  useFriendListener(updateFriendRequest);

  const handleClick = () => {
    router.push({
      pathname: "/Profile"
    });
  };

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
      alert(error.message);
    });
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
      alert(error.message);
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
    }, 100);
  }, [friendChange]);

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
    }, 300);
  }, [friendRequestChange]);

  return (
    <div>
      <Grid container>
        <Grid item xs={12} >
          <Typography variant="h5" className="header-message">Capybara Chat</Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            <ListItem button onClick={handleClick}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={authUserName}></ListItemText>
            </ListItem>
            <ListItem button onClick={ShowChats}>
              <ListItemIcon>
                <ChatIcon />
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
                  <Badge badgeContent={unreadFriendRequestsCount} color="secondary">
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
          <Grid item xs={12} style={{padding: "10px"}}>
            <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
          </Grid>
          <Divider />
          <List>
            {showChats ? (
              <>
                <ListItem button key="RemySharp">
                  <ListItemIcon>
                    <Avatar alt="Remy Sharp" src="https://material-ui.com/static/images/avatar/1.jpg" />
                  </ListItemIcon>
                  <ListItemText primary="Remy Sharp">Remy Sharp</ListItemText>
                  <ListItemText secondary="online" style={{ textAlign: "right" }}></ListItemText>
                </ListItem>
                {/* Add other chat items */}
              </>
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
              ></FriendList>
            )}
          </List>
        </Grid>

        <Grid item xs={9}>
          <List className={classes.messageArea}>
            {/* Display messages based on selected chat/friend */}
          </List>
          <Divider />
          <Grid container style={{padding: "20px"}}>
            <Grid item xs={11}>
              <CustomInput />
            </Grid>
            <Grid xs={1} style={{ textAlign: "right" }}>
              <Fab color="primary" aria-label="add"><SendIcon /></Fab>
            </Grid>
          </Grid>
        </Grid>

      </Grid>
    </div>
  );
};

export default Chatroom;