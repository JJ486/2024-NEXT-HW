import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import md5 from "md5";
import { FriendRequest } from "../api/types";
import { handleFriendRequest } from "../api/friend";

export default function FriendRequestDialog(props: any) {
  return (
    <Dialog open={props.open} onClose={props.onhandleClose}>
      <DialogTitle>Friend Requests</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your Friend Requests:
        </DialogContentText>
        <List>
          {props.friendRequests && props.friendRequests.map((request: FriendRequest) => (
              <ListItem key={request.username}>
              <ListItemAvatar>
                <Avatar alt={request.username} src={`https://www.gravatar.com/avatar/${md5(request.email.trim().toLowerCase())}?d=identicon&s=150`} />
              </ListItemAvatar>
              <ListItemText
                primary={`${request.nickname} (${request.username})`}
                secondary={`Email: ${request.email}, Status: ${request.status}, Role: ${request.role}, Timestamp: ${new Date(parseInt(request.timestamp)).toLocaleString()}`}
              />
              {(request.status === "Pending" && request.role === "receiver") ? (
                <>
                  <Button onClick={() => {
                    handleFriendRequest(request, true)
                    .then((res) => res.json())
                    .then((res) => {
                      if (Number(res.code) === 0) {
                        alert("You have accepted the friend request.");
                        props.onSetFriendChange(!props.friendChange);
                        props.onSetFriendRequestChange(!props.friendRequestChange);
                        props.onhandleFriendRequestClose();
                      }
                      else {
                        alert(res.info);
                      }
                    })
                    .catch((error) => {
                      alert(error.info);
                    });
                  }}>Accept</Button>
                  <Button onClick={() => {
                    handleFriendRequest(request, false)
                    .then((res) => res.json())
                    .then((res) => {
                      if (Number(res.code) === 0) {
                        alert("You have rejected the friend request.");
                        props.onSetFriendChange(!props.friendChange);
                        props.onSetFriendRequestChange(!props.friendRequestChange);
                        props.onhandleFriendRequestClose();
                      }
                      else {
                        alert(res.info);
                      }
                    })
                    .catch((error) => {
                      alert(error.info);
                    });
                  }}>Reject</Button>
                </>
              ) : null}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onhandleFriendRequestClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}