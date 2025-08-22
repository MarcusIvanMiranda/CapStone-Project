<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $id = $_GET['id'] ?? null;
    $owner_id = $_GET['owner_id'] ?? null;
    
    if ($id) {
        $sql = "SELECT c.*, o.name AS owner_name FROM cat c JOIN owner o ON c.owner_id = o.id WHERE c.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cat = $result->fetch_assoc();

        if ($cat) {
            echo json_encode($cat);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Cat not found."]);
        }
        $stmt->close();
    } elseif ($owner_id) {
        $sql = "SELECT * FROM cat WHERE owner_id = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $owner_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cats = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $cats[] = $row;
            }
        }
        echo json_encode($cats);
        $stmt->close();
    } else {
        $sql = "SELECT c.*, o.name AS owner_name FROM cat c JOIN owner o ON c.owner_id = o.id ORDER BY c.created_at DESC";
        $result = $conn->query($sql);
        $cats = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $cats[] = $row;
            }
        }
        echo json_encode($cats);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>