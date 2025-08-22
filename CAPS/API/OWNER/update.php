<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include '../DB_CONNECT/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT') {
    
    // Correctly accessing the POST data from the form
    if (
        !empty($_POST['id']) &&
        !empty($_POST['name']) &&
        !empty($_POST['contact']) &&
        !empty($_POST['gmail']) &&
        !empty($_POST['address'])
    ) {
        $id = $conn->real_escape_string($_POST['id']);
        $name = $conn->real_escape_string($_POST['name']);
        $contact = $conn->real_escape_string($_POST['contact']);
        $gmail = $conn->real_escape_string($_POST['gmail']);
        $address = $conn->real_escape_string($_POST['address']);
        
        $image = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            $uploadDir = '../../UPLOADS/owner/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('owner_') . '.' . $fileExtension;
            $uploadFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                $image = 'UPLOADS/owner/' . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to upload image."]);
                $conn->close();
                exit;
            }
        }
        
        $password = isset($_POST['password']) && !empty($_POST['password']) ? password_hash($conn->real_escape_string($_POST['password']), PASSWORD_DEFAULT) : null;
        
        // The column names in the query match your database table
        $sql = "UPDATE owner SET name = ?, contact = ?, gmail = ?, address = ?";
        $params = "ssss";
        $param_array = [$name, $contact, $gmail, $address];

        if ($image) {
            $sql .= ", image = ?";
            $params .= "s";
            $param_array[] = $image;
        }

        if ($password) {
            $sql .= ", password = ?";
            $params .= "s";
            $param_array[] = $password;
        }

        $sql .= " WHERE id = ?";
        $params .= "i";
        $param_array[] = $id;

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
             http_response_code(500);
             echo json_encode(["error" => "Prepare statement failed: " . $conn->error]);
             $conn->close();
             exit;
        }
        $stmt->bind_param($params, ...$param_array);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => "Owner updated successfully."]);
            } else {
                echo json_encode(["message" => "No changes were made."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error updating owner: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Incomplete data. Required fields: id, name, contact, gmail, address."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>
