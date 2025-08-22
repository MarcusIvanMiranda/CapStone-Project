<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'] ?? null;

    if ($id) {
        $sql = "DELETE FROM owner WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => "Owner deleted successfully."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Owner not found."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error deleting owner: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Owner ID is required."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>