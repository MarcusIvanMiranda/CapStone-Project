<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $note = $_POST['note'] ?? '';

    if (!empty($note)) {
        $note = $conn->real_escape_string($note);

        $sql = "INSERT INTO notes (note) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $note);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Note created successfully.", "id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error creating note: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Note content cannot be empty."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>