<?php
/**
 * Created by IntelliJ IDEA.
 * User: Marq
 * Date: 29.11.2018
 * Time: 20:31
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// include database and object files
include_once '../../config/database.php';
include_once '../../models/user.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));
$user= new User($db);


if(!empty($data)){

    $ans = $user->getResultForQuestion($data->id_user, $data->id_subject);
    http_response_code(200);
    echo json_encode($ans);
}
else{
    http_response_code(400);
    echo json_encode(array("message" => "Puste dane"));
}
