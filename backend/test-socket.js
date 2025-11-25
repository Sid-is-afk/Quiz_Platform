const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");
const socket2 = io("http://localhost:5000");

const ROOM_CODE = "TEST_ROOM";

console.log("Connecting to server...");

socket.on("connect", () => {
    console.log("Client 1 connected:", socket.id);
    socket.emit("create_room", { roomCode: ROOM_CODE, quizId: "123", hostName: "HostUser" });
});

socket2.on("connect", () => {
    console.log("Client 2 connected:", socket2.id);
    // Wait a bit for room to be created
    setTimeout(() => {
        socket2.emit("join_room", { roomCode: ROOM_CODE, playerName: "Player2" });
    }, 1000);
});

socket.on("room_created", (data) => {
    console.log("Room created:", data);
});

socket.on("player_joined", (players) => {
    console.log("Player joined. Current players:", players);
    if (players.length === 2) {
        console.log("Starting game...");
        socket.emit("start_game", ROOM_CODE);
    }
});

socket.on("game_started", (game) => {
    console.log("Game started!", game);
    process.exit(0);
});

socket.on("error", (err) => {
    console.error("Socket error:", err);
});
