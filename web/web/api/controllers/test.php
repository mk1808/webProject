<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


include_once '../config/database.php';
include_once '../models/question.php';
include_once '../models/answer.php';
include_once '../models/subject.php';

$database = new Database();
$db = $database->getConnection();

$subject = new Subject($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data)){

    $ans = $subject->checkAnswers($data->questions);
    http_response_code(200);
    echo json_encode($ans);
}
else{
    http_response_code(400);
    echo json_encode(array("message" => "Data is incomplete."));
}
