<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $sql = "SELECT id, name, contact, gmail, address, image, created_at FROM owner WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $owner = $result->fetch_assoc();
        
        if ($owner) {
            echo json_encode($owner);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Owner not found."]);
        }
        $stmt->close();
    } else {
        $sql = "SELECT id, name, contact, gmail, address, image, created_at FROM owner ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $owners = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $owners[] = $row;
            }
        }
        echo json_encode($owners);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>