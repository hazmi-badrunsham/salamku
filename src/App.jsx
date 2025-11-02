// src/App.jsx
import { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTION_ID } from "./appwrite";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentLetter, setCurrentLetter] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [letters, setLetters] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [showInbox, setShowInbox] = useState(false);
  const [sending, setSending] = useState(false);

  // Load saved state from localStorage using generic keys
  useEffect(() => {
    const savedProgress = localStorage.getItem("user_progress");
    if (savedProgress) setProgress(parseInt(savedProgress));

    const savedMine = localStorage.getItem("user_my_messages");
    if (savedMine) {
      try {
        const parsed = JSON.parse(savedMine);
        setMyMessages(Array.isArray(parsed) ? parsed : []);
      } catch {
        setMyMessages([]);
      }
    }

    const savedDisplayed = localStorage.getItem("user_displayed_messages");
    if (savedDisplayed) {
      try {
        const parsed = JSON.parse(savedDisplayed);
        const filtered = parsed.filter((msg) => msg.sender !== "system");
        setDisplayedMessages(Array.isArray(filtered) ? filtered : []);
      } catch {
        setDisplayedMessages([]);
      }
    }
  }, []);

  // Fetch letters when authenticated
  useEffect(() => {
    if (isAuthenticated) fetchLetters();
  }, [isAuthenticated]);

  // Poll every 5 seconds
  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      interval = setInterval(fetchLetters, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (username.toLowerCase() === "user") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("wrong username");
    }
  };

  const fetchLetters = async () => {
    try {
      console.log("Fetching messages from Appwrite...");
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [], // Get ALL messages
        ["$createdAt"], // Use Appwrite's built-in timestamp
        [],
        100
      );

      console.log("Fetched messages:", response.documents);

      const messages = response.documents.map((doc) => ({
        id: doc.$id,
        sender: doc.sender,
        message: doc.message,
        created_at: doc.$createdAt, // Use Appwrite's built-in field
      }));

      setLetters(messages);
      
      // Check if there are new messages that should be displayed
      checkForNewMessages(messages);
    } catch (error) {
      console.error("Error fetching letters:", error);
    }
  };

  // Fixed function to check for new messages
  const checkForNewMessages = (allMessages) => {
    const messagesFromOthers = allMessages.filter(msg => msg.sender !== username);
    const currentDisplayedIds = displayedMessages.map(msg => msg.id);
    const newMessages = messagesFromOthers.filter(msg => 
      !currentDisplayedIds.includes(msg.id)
    );

    // If there are new messages and we've read all previous ones, reset progress
    if (newMessages.length > 0) {
      const messagesFromOthersCount = messagesFromOthers.length;
      if (progress >= messagesFromOthersCount - newMessages.length) {
        setProgress(messagesFromOthersCount - newMessages.length);
        localStorage.setItem("user_progress", (messagesFromOthersCount - newMessages.length).toString());
      }
    }
  };

  const typeWriter = (text, message) => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const speed = 40;
    let currentText = "";
    const interval = setInterval(() => {
      if (i < text.length) {
        currentText += text[i];
        setDisplayedText(currentText);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);

        if (message.sender !== "system") {
          const updated = [...displayedMessages, message];
          setDisplayedMessages(updated);
          localStorage.setItem("user_displayed_messages", JSON.stringify(updated));
        }

        setDisplayedText("");
      }
    }, speed);
  };

  const handlePom = () => {
    if (isTyping) return;
    
    // Filter out messages from current user for display
    const messagesFromOthers = letters.filter(msg => msg.sender !== username);
    
    if (progress < messagesFromOthers.length) {
      const nextLetter = messagesFromOthers[progress];
      
      // Check if this message is already displayed
      const isAlreadyDisplayed = displayedMessages.some(msg => msg.id === nextLetter.id);
      
      if (!isAlreadyDisplayed) {
        setCurrentLetter(nextLetter);
        typeWriter(nextLetter.message, nextLetter);
        const newProgress = progress + 1;
        setProgress(newProgress);
        saveProgress(newProgress);
      } else {
        // Skip already displayed messages
        const newProgress = progress + 1;
        setProgress(newProgress);
        saveProgress(newProgress);
        handlePom(); // Recursively try next message
      }
    } else {
      const systemMessage = {
        id: "none",
        sender: "system",
        message: "No more letters... for now 💔",
        created_at: new Date().toISOString(),
      };
      setCurrentLetter(systemMessage);
      typeWriter(systemMessage.message, systemMessage);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || sending) return;

    setSending(true);

    const newMessage = {
      id: `local-${Date.now()}`,
      sender: username,
      message: reply.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedMyMessages = [...myMessages, newMessage];
    setMyMessages(updatedMyMessages);
    localStorage.setItem("user_my_messages", JSON.stringify(updatedMyMessages));
    
    const replyText = reply.trim();
    setReply("");

    try {
      console.log("Attempting to send message to Appwrite...");
      console.log("Database ID:", DATABASE_ID);
      console.log("Collection ID:", COLLECTION_ID);
      console.log("Message content:", {
        sender: username,
        message: replyText,
        // Removed created_at - Appwrite will handle timestamps automatically
      });

      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        "unique()",
        {
          sender: username,
          message: replyText,
          // Don't include created_at - Appwrite adds it automatically
        }
      );

      console.log("Message sent successfully:", doc);

      const updatedWithServerId = updatedMyMessages.map((msg) =>
        msg.id === newMessage.id
          ? {
              id: doc.$id,
              sender: doc.sender,
              message: doc.message,
              created_at: doc.$createdAt, // Use Appwrite's built-in timestamp
            }
          : msg
      );

      setMyMessages(updatedWithServerId);
      localStorage.setItem("user_my_messages", JSON.stringify(updatedWithServerId));
      
      // Refresh messages after sending
      await fetchLetters();
      
    } catch (error) {
      console.error("Detailed error sending message:", error);
      console.error("Error type:", error.type);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Show more specific error message
      if (error.code === 401) {
        alert("Authentication error: Check your Appwrite project ID and endpoint");
      } else if (error.code === 404) {
        alert("Database not found: Check your Database ID and Collection ID");
      } else if (error.code === 403) {
        alert("Permission denied: Check your database permissions");
      } else {
        alert(`Failed to send message: ${error.message}`);
      }
    } finally {
      setSending(false);
    }
  };

  const saveProgress = (count) => {
    localStorage.setItem("user_progress", count.toString());
  };

  // Calculate messages from others only
  const messagesFromOthers = letters.filter(msg => msg.sender !== username);
  const messagesLeft = Math.max(messagesFromOthers.length - progress, 0);

  if (!isAuthenticated) {
    return (
      <div className="login-popup">
        <div className="login-box">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="enter your name..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <button onClick={handleLogin}>Enter</button>
          {loginError && <p className="error">{loginError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="counter">
        {messagesLeft > 0
          ? `You have ${messagesLeft} new message${messagesLeft > 1 ? "s" : ""}`
          : "All caught up"}
      </div>

      <div className="chat-box">
        {displayedMessages.length === 0 && !displayedText ? (
          <p className="placeholder">press Receive 💌 to reveal a letter</p>
        ) : (
          <>
            {displayedMessages.map((msg) => (
              <p key={msg.id} className="message">
                <span className="sender">{msg.sender}:</span> {msg.message}
              </p>
            ))}
            {displayedText && (
              <p className="message typing">
                <span className="sender">{currentLetter?.sender}:</span>{" "}
                {displayedText}
              </p>
            )}
          </>
        )}
      </div>

      <div className="controls">
        <button onClick={handlePom} disabled={isTyping}>
          {isTyping ? "Typing..." : "Receive 💌"}
        </button>
        <button className="inbox-btn" onClick={() => setShowInbox(true)}>
          Inbox 📬
        </button>
      </div>

      {showInbox && (
        <div className="inbox-popup">
          <div className="inbox-content">
            <button
              className="close-icon"
              onClick={() => setShowInbox(false)}
              aria-label="Close Inbox"
            >
              ×
            </button>
            <h3>Inbox Messages 💌</h3>
            {displayedMessages.length === 0 ? (
              <p>No messages revealed yet.</p>
            ) : (
              displayedMessages.map((msg) => (
                <div key={msg.id} className="inbox-message">
                  <strong>{msg.sender}</strong>
                  <p>
                    {msg.message.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="reply-box">
        <textarea
          placeholder="write your message here..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReply();
            }
          }}
          disabled={sending}
        />
        <button onClick={handleReply} disabled={!reply.trim() || sending}>
          {sending ? "Sending..." : "Send 💌"}
        </button>
      </div>

         <iframe
        data-testid="embed-iframe"
        style={{ borderRadius: "12px", marginTop: "24px", width: "100%" }}
        src="https://open.spotify.com/embed/playlist/2IDfCT1OH94cFpp2KAXjrQ?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Playlist Embed"
      ></iframe>
    </div>
  );
}

export default App;