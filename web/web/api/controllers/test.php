<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// include database and object files
include_once '../config/database.php';
include_once '../models/question.php';
include_once '../models/answer.php';
include_once '../models/subject.php';


$database = new Database();
$db = $database->getConnection();
$query = "SELECT TEXT FROM QUESTION";
$stmt = $db->prepare($query);

$stmt->execute();


$num = $stmt->rowCount();
echo json_encode($stmt->fetchAll()[0][0]);