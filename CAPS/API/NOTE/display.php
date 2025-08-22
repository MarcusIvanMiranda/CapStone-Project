<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['id'])) {
        $id = $conn->real_escape_string($_GET['id']);
        $sql = "SELECT id, note, created_at FROM notes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $note = $result->fetch_assoc();
        
        if ($note) {
            echo json_encode($note);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Note not found."]);
        }
        $stmt->close();
    } else {
        $sql = "SELECT id, note, created_at FROM notes ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $notes = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $notes[] = $row;
            }
        }
        echo json_encode($notes);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>