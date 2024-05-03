import { useEffect } from "react";
import Cookies from "js-cookie";

export const useWebsocketListener = (fn: (arg?: string) => void, type: number) => {
  const jwtToken = Cookies.get("jwt_token");
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`ws://backend-dev-Capybara.app.secoder.net/ws/?jwt=${jwtToken}`);

      ws.onopen = () => {
        console.log("WebSocket Connected");
      };

      ws.onmessage = async (event) => {
        if (type === 0) {
          if (event.data === "new friend request") fn();
        }
        else if (type === 1) {
          if (event.data.substring(0, 16) === "new friend added"){
            var friendname = event.data.substring(17);
            fn(friendname);
          }
        }
        else if (type === 2) {
          if (event.data.substring(0, 21) === "message has been read") fn();
        }
        else if (type === 3) {
          if (event.data.substring(0, 27) === "new message in conversation") fn();
        }
        else if (type === 4) {
          if (event.data === "new group request") fn();
        }
        else if (type === 5) {
          if (event.data === "new group invitation") fn();
        }
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
        if (!closed) {
          console.log("Attempting to reconnect...");
          setTimeout(() => {
            connect();
          }, 1000);
        }
      };
    };

    connect();

    return () => {
      if (ws) {
        closed = true;
        ws.close();
      }
    };
  }, [fn]);
};