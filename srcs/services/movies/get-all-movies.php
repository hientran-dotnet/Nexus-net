<?php
// Enable error reporting
// error_reporting(E_ALL);
// ini_set('display_errors', 1);


header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Include database configuration
require_once(__DIR__ . "/../config.php");

try {
    // Build query with filters
    $sql = "SELECT * FROM movies WHERE 1=1";
    $params = [];
    $bindings = [];
    
    // Add filters if provided
    if (isset($_GET['genre']) && !empty($_GET['genre'])) {
        $sql .= " AND genre LIKE ?";
        $bindings[] = '%' . $_GET['genre'] . '%';
    }
    
    if (isset($_GET['rating']) && !empty($_GET['rating'])) {
        $sql .= " AND rating = ?";
        $bindings[] = $_GET['rating'];
    }
    
    if (isset($_GET['year']) && !empty($_GET['year'])) {
        $sql .= " AND YEAR(release_date) = ?";
        $bindings[] = intval($_GET['year']);
    }
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $sql .= " AND (title LIKE ? OR description LIKE ?)";
        $bindings[] = '%' . $_GET['search'] . '%';
        $bindings[] = '%' . $_GET['search'] . '%';
    }
    
    // Add ordering
    $orderBy = isset($_GET['order_by']) ? $_GET['order_by'] : 'id';
    $orderDir = isset($_GET['order_dir']) ? strtoupper($_GET['order_dir']) : 'ASC';
    $orderDir = in_array($orderDir, ['ASC', 'DESC']) ? $orderDir : 'ASC';
    
    $allowedOrderBy = ['id', 'title', 'genre', 'rating', 'release_date'];
    if (in_array($orderBy, $allowedOrderBy)) {
        $sql .= " ORDER BY {$orderBy} {$orderDir}";
    }
    
    // Add pagination
    if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
        $limit = max(1, intval($_GET['limit']));
        $offset = isset($_GET['offset']) && is_numeric($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;
        $sql .= " LIMIT {$limit} OFFSET {$offset}";
    }
    
    // Execute query
    $stmt = $conn->prepare($sql);
    $stmt->execute($bindings);
    $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM movies WHERE 1=1";
    $countBindings = [];
    
    // Rebuild conditions for count query
    if (isset($_GET['genre']) && !empty($_GET['genre'])) {
        $countSql .= " AND genre LIKE ?";
        $countBindings[] = '%' . $_GET['genre'] . '%';
    }
    
    if (isset($_GET['rating']) && !empty($_GET['rating'])) {
        $countSql .= " AND rating = ?";
        $countBindings[] = $_GET['rating'];
    }
    
    if (isset($_GET['year']) && !empty($_GET['year'])) {
        $countSql .= " AND YEAR(release_date) = ?";
        $countBindings[] = intval($_GET['year']);
    }
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $countSql .= " AND (title LIKE ? OR description LIKE ?)";
        $countBindings[] = '%' . $_GET['search'] . '%';
        $countBindings[] = '%' . $_GET['search'] . '%';
    }
    
    $countStmt = $conn->prepare($countSql);
    $countStmt->execute($countBindings);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Format response
    $response = [
        'success' => true,
        'data' => $movies,
        'total_count' => intval($totalCount),
        'returned_count' => count($movies),
        'filters' => [
            'genre' => $_GET['genre'] ?? null,
            'rating' => $_GET['rating'] ?? null,
            'year' => $_GET['year'] ?? null,
            'search' => $_GET['search'] ?? null,
            'order_by' => $orderBy,
            'order_dir' => $orderDir
        ]
    ];
    
    // Add pagination info if limit was set
    if (isset($_GET['limit'])) {
        $response['pagination'] = [
            'limit' => intval($_GET['limit']),
            'offset' => intval($_GET['offset'] ?? 0),
            'has_more' => (intval($_GET['offset'] ?? 0) + count($movies)) < $totalCount
        ];
    }
    
    http_response_code(200);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'debug_info' => [
            'sql' => $sql ?? 'N/A',
            'bindings' => $bindings ?? []
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>