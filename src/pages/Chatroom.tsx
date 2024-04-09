import React, { useState, useEffect } from "react";
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
import Avatar from "@material-ui/core/Avatar";
import Fab from "@material-ui/core/Fab";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useRouter } from "next/router";
import { setName, setToken } from "../redux/auth";
import { useDispatch } from "react-redux";

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

  const router = useRouter();
  const dispatch = useDispatch();
  const authUserName = useSelector((state: RootState) => state.auth.name);

  const toggleShowChats = () => {
    setShowChats(!showChats);
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

  const handleClick = () => {
    console.log("Stored username:", authUserName);
    router.push({
      pathname: "/Profile"
      // query: { username: cookie_username }
    });
  };

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
            <ListItem button onClick={toggleShowChats}>
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chats"></ListItemText>
            </ListItem>
            <ListItem button onClick={toggleShowChats}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Friends"></ListItemText>
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
              <>
                <ListItem button key="Alice">
                  <ListItemIcon>
                    <Avatar alt="Alice" src="https://material-ui.com/static/images/avatar/3.jpg" />
                  </ListItemIcon>
                  <ListItemText primary="Alice">Alice</ListItemText>
                </ListItem>
                {/* Add other friend items */}
              </>
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
              <TextField id="outlined-basic-email" label="Type Something" fullWidth />
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