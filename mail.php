<?php
//// Файлы phpmailer
//require 'php/phpmailer/PHPMailer.php';
//require 'php/phpmailer/SMTP.php';
//require 'php/phpmailer/Exception.php';
//
//$title = "Тема письма";
//$file = $_FILES['file'];
//
//$c = true;
//// Формирование самого письма
//$title = "Заголовок письма";
//foreach ( $_POST as $key => $value ) {
//  if ( $value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject" ) {
//    $body .= "
//    " . ( ($c = !$c) ? '<tr>':'<tr style="background-color: #f8f8f8;">' ) . "
//      <td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
//      <td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
//    </tr>
//    ";
//  }
//}
//
//$body = "<table style='width: 100%;'>$body</table>";
//
//// Настройки PHPMailer
//$mail = new PHPMailer\PHPMailer\PHPMailer();
//
//try {
//  $mail->isSMTP();
//  $mail->CharSet = "UTF-8";
//  $mail->SMTPAuth   = true;
//
//  // Настройки вашей почты
//  $mail->Host       = 'smtp.gmail.com'; // SMTP сервера вашей почты
//  $mail->Username   = 'slagrach@gmail.com'; // Логин на почте
//  $mail->Password   = 'WorldofWarcraft2017'; // Пароль на почте
//  $mail->SMTPSecure = 'ssl';
//  $mail->Port       = 465;
//
//  $mail->setFrom('slagrach@gmail.com', 'Заявка с вашего сайта'); // Адрес самой почты и имя отправителя
//
//  // Получатель письма
//  $mail->addAddress('');
//
//  // Прикрипление файлов к письму
////  if (!empty($file['name'][0])) {
////    for ($ct = 0; $ct < count($file['tmp_name']); $ct++) {
////      $uploadfile = tempnam(sys_get_temp_dir(), sha1($file['name'][$ct]));
////      $filename = $file['name'][$ct];
////      if (move_uploaded_file($file['tmp_name'][$ct], $uploadfile)) {
////          $mail->addAttachment($uploadfile, $filename);
////          $rfile[] = "Файл $filename прикреплён";
////      } else {
////          $rfile[] = "Не удалось прикрепить файл $filename";
////      }
////    }
////  }
//
//  // Отправка сообщения
//  $mail->isHTML(true);
//  $mail->Subject = $title;
//  $mail->Body = $body;
//
//  $mail->send();
//
//} catch (Exception $e) {
//  $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
//}


$method = $_SERVER['REQUEST_METHOD'];

//Script Foreach
$c = true;
if ($method === 'POST') {

	$project_name = trim($_POST["project_name"]);
	$admin_email = trim($_POST["admin_email"]);
	$form_subject = trim($_POST["form_subject"]);

	foreach ($_POST as $key => $value) {
		if ($value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject") {
			$message .= "
			" . (($c = !$c) ? '<tr>' : '<tr style="background-color: #f8f8f8;">') . "
				<td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
				<td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
			</tr>
			";
		}
	}
} else if ($method === 'GET') {

	$project_name = trim($_GET["project_name"]);
	$admin_email = trim($_GET["admin_email"]);
	$form_subject = trim($_GET["form_subject"]);

	foreach ($_GET as $key => $value) {
		if ($value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject") {
			$message .= "
			" . (($c = !$c) ? '<tr>' : '<tr style="background-color: #f8f8f8;">') . "
				<td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
				<td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
			</tr>
			";
		}
	}
}

$message = "<table style='width: 100%;'>$message</table>";

function adopt($text)
{
	return '=?UTF-8?B?' . Base64_encode($text) . '?=';
}

$headers = "MIME-Version: 1.0" . PHP_EOL .
	"Content-Type: text/html; charset=utf-8" . PHP_EOL .
	'From: ' . adopt($project_name) . ' <' . $admin_email . '>' . PHP_EOL .
	'Reply-To: ' . $admin_email . '' . PHP_EOL;

mail($admin_email, adopt($form_subject), $message, $headers);
