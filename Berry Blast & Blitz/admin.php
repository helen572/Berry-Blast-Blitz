<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payments Management</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="admin1.css">
</head>
<body>
    <h2>Payment</h2>
    <table>
        <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Card Number</th>
            <th>Expiry Month</th>
            <th>Expiry Year</th>
            <th>CVV</th>
        </tr>
        <?php
    // Connect to the database
    $servername = "localhost";
    $username = "root"; // Change to your MySQL username
    $password = ""; // Change to your MySQL password
    $dbname = "berry blast & blitz";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Query payment table
    $sql = "SELECT name, phone, address, card_number, expiry_month, expiry_year, cvv FROM payment";
    $result = $conn->query($sql);

    // Check for errors
    if (!$result) {
        die("Query failed: " . $conn->error);
    }
    // Counter for serial numbers
    $serialNumber = 1;

    // Check if there are any rows returned
    if ($result->num_rows > 0) {
        // Output data of each row
        while($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>".$serialNumber."</td>";
            echo "<td>".$row["name"]."</td>";
            echo "<td>".$row["phone"]."</td>";
            echo "<td>".$row["address"]."</td>";
            echo "<td>".$row["card_number"]."</td>";
            echo "<td>".$row["expiry_month"]."</td>";
            echo "<td>".$row["expiry_year"]."</td>";
            echo "<td>".$row["cvv"]."</td>";
            echo "</tr>";
            $serialNumber++; // Increment serial number for next row
        }
    } else {
        echo "<tr><td colspan='8'>No payments found</td></tr>";
    }
    $conn->close();
?>

    </table>
</body>
</html>