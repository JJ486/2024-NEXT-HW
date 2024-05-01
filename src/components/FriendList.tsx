import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, Avatar } from "@material-ui/core";
import md5 from "md5";
import { Friend } from "../api/types";
import "./FriendList.module.css";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import TrashCanIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AddFriendTagDialog from "./AddFriendTagDialog";

export default function FriendList(props: any) {
  return (
    <List>
      {props.friends.map((friend: Friend) => {
        const hash = md5(friend.email.trim().toLowerCase());
        const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
        return (
          <ListItem button key={friend.username}>
            <ListItemIcon>
              <Avatar alt={friend.username} src={gravatarUrl} />
            </ListItemIcon>
            <ListItemText primary={friend.username} secondary={friend.tag} />
            <ListItemSecondaryAction>
            <IconButton aria-label="Add Tag" onClick={() => props.onhandleClickAddFriendTagOpen(friend.username)}>
              <LocalOfferIcon />
            </IconButton>
            <AddFriendTagDialog
              open={props.addTagOpen}
              friendTag={props.friendTag}
              setFriendTag={props.setFriendTag}
              onhandleAddFriendTagClose={props.onhandleClickAddFriendTagClose}
              onhandleAddFriendTag={props.onhandleAddFriendTag}
            ></AddFriendTagDialog>
            <IconButton aria-label="Delete" onClick={() => props.onDeleteFriend(friend.username)}>
              <TrashCanIcon />
            </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}

