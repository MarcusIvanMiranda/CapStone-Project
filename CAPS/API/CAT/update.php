<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include '../DB_CONNECT/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if required data is present in the POST request
    if (
        isset($_POST['id']) &&
        isset($_POST['name']) &&
        isset($_POST['breed']) &&
        isset($_POST['birth_date'])
    ) {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $breed = $_POST['breed'];
        $birth_date = $_POST['birth_date'];

        $image = null;
        // Handle image upload if a file is provided and there are no errors
        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            $uploadDir = '../../UPLOADS/cat/';
            // Create the directory if it does not exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('cat_') . '.' . $fileExtension;
            $uploadFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                $image = 'UPLOADS/cat/' . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to upload image."]);
                $conn->close();
                exit;
            }
        }
        
        // Prepare the SQL query based on whether a new image was uploaded
        if ($image) {
            $sql = "UPDATE cat SET name = ?, breed = ?, birth_date = ?, image = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssi", $name, $breed, $birth_date, $image, $id);
        } else {
            $sql = "UPDATE cat SET name = ?, breed = ?, birth_date = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $name, $breed, $birth_date, $id);
        }

        if ($stmt === false) {
             http_response_code(500);
             echo json_encode(["error" => "Prepare statement failed: " . $conn->error]);
             $conn->close();
             exit;
        }

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => "Cat updated successfully."]);
            } else {
                echo json_encode(["message" => "No changes were made."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error updating cat: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Incomplete data. Required fields: id, name, breed, and birth_date."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>
