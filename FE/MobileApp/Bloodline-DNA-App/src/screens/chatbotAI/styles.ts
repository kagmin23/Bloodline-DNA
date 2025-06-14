import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007bff",
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  messages: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  messageContainer: {
    marginBottom: 8,
    flexDirection: "row",
  },
  messageLeft: {
    justifyContent: "flex-start",
  },
  messageRight: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#007bff",
  },
  botBubble: {
    backgroundColor: "#e2e2e2",
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: "white",
  },
  botText: {
    color: "#333",
  },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginLeft: 8,
  },
  sendText: {
    color: "white",
    fontWeight: "bold",
  },
});