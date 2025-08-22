<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include '../DB_CONNECT/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Correctly accessing the POST data from the form
    $name = $_POST['name'] ?? '';
    $contact = $_POST['contact'] ?? '';
    $gmail = $_POST['gmail'] ?? '';
    $address = $_POST['address'] ?? '';
    $password = $_POST['password'] ?? '';
    $image = null;

    if (empty($name) || empty($contact) || empty($gmail) || empty($address) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Incomplete data. Required fields: name, contact, gmail, address, and password."]);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Handle image upload if a file is provided
    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $uploadDir = '../../UPLOADS/owner/';
        // Create the directory if it does not exist
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
            exit;
        }
    }

    // Use prepared statement to prevent SQL injection
    // The column names in the query match your database table
    $sql = "INSERT INTO owner (name, contact, gmail, address, password, image) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["error" => "Prepare statement failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ssssss", $name, $contact, $gmail, $address, $hashed_password, $image);

    if ($stmt->execute()) {
        echo json_encode(["success" => "New owner created successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error creating owner: " . $stmt->error]);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>
