<?php
include '../DB_CONNECT/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $owner_id = $_POST['owner_id'] ?? '';
    $name = $_POST['name'] ?? '';
    $breed = $_POST['breed'] ?? '';
    $birth_date = $_POST['birth_date'] ?? '';
    $image = null;

    if (
        !empty($owner_id) &&
        !empty($name) &&
        !empty($breed) &&
        !empty($birth_date)
    ) {
        // Handle image upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            $uploadDir = '../../UPLOADS/cat/';
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

        $owner_id = $conn->real_escape_string($owner_id);
        $name = $conn->real_escape_string($name);
        $breed = $conn->real_escape_string($breed);
        $birth_date = $conn->real_escape_string($birth_date);

        $sql = "INSERT INTO cat (owner_id, name, breed, birth_date, image) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issss", $owner_id, $name, $breed, $birth_date, $image);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Cat created successfully.", "id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error creating cat: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Incomplete data. Required fields: owner_id, name, breed, and birth_date."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}

$conn->close();
?>
