<?php
    // Set content type to JSON
    header('Content-Type: application/json');
    
    // Check if form was submitted
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
    
    // If this is an AJAX action (cart actions), handle here before checkout validation
    if (isset($_POST['action'])) {
        $action = $_POST['action'];

        $servername = "localhost";
        $username = "root";
        $password = "";
        $database = "Berry Blast & Blitz";

        // Connect to DB
        $conn = new mysqli($servername, $username, $password, $database);
        if ($conn->connect_error) {
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }

        // Ensure cart table exists
        $create_sql = "CREATE TABLE IF NOT EXISTS `cart` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT DEFAULT 0,
            product_name VARCHAR(255) DEFAULT '',
            price DECIMAL(10,2) DEFAULT 0.00,
            quantity INT DEFAULT 1,
            user_id INT DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        $conn->query($create_sql);

        // For simplicity this demo assumes a single user (user_id = 1)
        $user_id = 1;

        if ($action === 'add_to_cart') {
            $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
            $product_name = isset($_POST['product_name']) ? trim($_POST['product_name']) : '';
            $price = isset($_POST['price']) ? floatval($_POST['price']) : 0.00;
            $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

            // If the same product already exists in the cart for this user, increment its quantity instead of inserting a new row
            $checkStmt = $conn->prepare('SELECT id, quantity FROM cart WHERE product_id = ? AND user_id = ? LIMIT 1');
            if ($checkStmt) {
                $checkStmt->bind_param('ii', $product_id, $user_id);
                $checkStmt->execute();
                $res = $checkStmt->get_result();
                if ($row = $res->fetch_assoc()) {
                    // update existing quantity
                    $existingId = intval($row['id']);
                    $newQty = intval($row['quantity']) + $quantity;
                    $upd = $conn->prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?');
                    if ($upd) {
                        $upd->bind_param('iii', $newQty, $existingId, $user_id);
                        if ($upd->execute()) {
                            echo json_encode(['success' => true, 'message' => 'Item quantity updated in cart']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Failed to update item quantity']);
                        }
                        $upd->close();
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
                    }
                    $checkStmt->close();
                    $conn->close();
                    exit;
                }
                $checkStmt->close();
            }

            // Insert new cart row
            $stmt = $conn->prepare('INSERT INTO cart (product_id, product_name, price, quantity, user_id) VALUES (?, ?, ?, ?, ?)');
            if ($stmt) {
                $stmt->bind_param('isdii', $product_id, $product_name, $price, $quantity, $user_id);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Item added to cart']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to add item to cart']);
                }
                $stmt->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            }

            $conn->close();
            exit;
        }

        if ($action === 'view_cart') {
            $stmt = $conn->prepare('SELECT id, product_id, product_name, price, quantity, added_at FROM cart WHERE user_id = ? ORDER BY added_at DESC');
            $items = [];
            if ($stmt) {
                $stmt->bind_param('i', $user_id);
                $stmt->execute();
                $res = $stmt->get_result();
                while ($row = $res->fetch_assoc()) {
                    $items[] = $row;
                }
                $stmt->close();
                echo json_encode(['success' => true, 'items' => $items]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            }
            $conn->close();
            exit;
        }

        if ($action === 'remove_from_cart') {
            $cart_id = isset($_POST['cart_id']) ? intval($_POST['cart_id']) : 0;
            $stmt = $conn->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
            if ($stmt) {
                $stmt->bind_param('ii', $cart_id, $user_id);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Item removed']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to remove item']);
                }
                $stmt->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            }
            $conn->close();
            exit;
        }

        // Increment quantity for a cart row
        if ($action === 'increment_qty') {
            $cart_id = isset($_POST['cart_id']) ? intval($_POST['cart_id']) : 0;
            $stmt = $conn->prepare('UPDATE cart SET quantity = quantity + 1 WHERE id = ? AND user_id = ?');
            if ($stmt) {
                $stmt->bind_param('ii', $cart_id, $user_id);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Quantity increased']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to increase quantity']);
                }
                $stmt->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            }
            $conn->close();
            exit;
        }

        // Decrement quantity for a cart row (delete if quantity reaches 0)
        if ($action === 'decrement_qty') {
            $cart_id = isset($_POST['cart_id']) ? intval($_POST['cart_id']) : 0;
            // reduce quantity
            $stmt = $conn->prepare('UPDATE cart SET quantity = quantity - 1 WHERE id = ? AND user_id = ?');
            if ($stmt) {
                $stmt->bind_param('ii', $cart_id, $user_id);
                if ($stmt->execute()) {
                    // if quantity is now 0 or less, remove the row
                    $check = $conn->prepare('SELECT quantity FROM cart WHERE id = ? AND user_id = ? LIMIT 1');
                    if ($check) {
                        $check->bind_param('ii', $cart_id, $user_id);
                        $check->execute();
                        $res = $check->get_result();
                        if ($row = $res->fetch_assoc()) {
                            if (intval($row['quantity']) <= 0) {
                                $del = $conn->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
                                if ($del) {
                                    $del->bind_param('ii', $cart_id, $user_id);
                                    $del->execute();
                                    $del->close();
                                }
                            }
                        }
                        $check->close();
                    }
                    echo json_encode(['success' => true, 'message' => 'Quantity decreased']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to decrease quantity']);
                }
                $stmt->close();
            } else {
                echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            }
            $conn->close();
            exit;
        }
        
        // Unknown action
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
        $conn->close();
        exit;
    }
    
    // ...existing code...
?>
