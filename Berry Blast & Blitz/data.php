<?php
    // Set content type to JSON
    header('Content-Type: application/json');
    
    // Check if form was submitted
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
    
    // Validate required fields
    $required_fields = ['name', 'phone', 'address', 'card_number', 'expiry_month', 'expiry_year', 'cvv'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            echo json_encode(['success' => false, 'message' => "Error: $field is required"]);
            exit;
        }
    }

    $servername = "localhost";
    $username = "root";
    $password = "";
    $database = "Berry Blast & Blitz";

    try {
        $conn = new mysqli($servername, $username, $password, $database);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        // Sanitize input data (basic protection)
        $name = trim($_POST['name']);
        $phone = trim($_POST['phone']);
        $address = trim($_POST['address']);
        $card_number = trim($_POST['card_number']);
        $expiry_month = trim($_POST['expiry_month']);
        $expiry_year = trim($_POST['expiry_year']);
        $cvv = trim($_POST['cvv']);

        // Use prepared statement to prevent SQL injection
        $stmt = $conn->prepare("INSERT INTO payment (name, phone, address, card_number, expiry_month, expiry_year, cvv) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        if ($stmt === false) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("sssssss", $name, $phone, $address, $card_number, $expiry_month, $expiry_year, $cvv);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Checkout complete! Thank you for your order.']);
        } else {
            throw new Exception("Error inserting data: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();

    } catch (Exception $e) {
        // For development: show error. For production: log error and show generic message
        echo json_encode(['success' => false, 'message' => 'Sorry, there was an error processing your order. Please try again.']);
        
        // In production, you should log this error:
        // error_log($e->getMessage());
    }
?>