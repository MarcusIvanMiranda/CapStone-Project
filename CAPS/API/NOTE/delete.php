<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'] ?? '';

    if (!empty($id)) {
        $id = $conn->real_escape_string($id);

        $sql = "DELETE FROM notes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => "Note deleted successfully."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Note not found."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error deleting note: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Note ID is required."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>