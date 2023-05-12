<?php
// require 'php/phpmailer/PHPMailer.php';
// require 'php/phpmailer/SMTP.php';
// require 'php/phpmailer/Exception.php';
// $title = "Тема письма";
// $file = $_FILES['file'];
// $c = true;
// $title = "Заголовок письма";
// foreach ( $_POST as $key => $value ) {
//   if ( $value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject" ) {
//     $body .= "
//     " . ( ($c = !$c) ? '<tr>':'<tr style="background-color: #f8f8f8;">' ) . "
//       <td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
//       <td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
//     </tr>
//     ";
//   }
// }
// $body = "<table style='width: 100%;'>$body</table>";
// $mail = new PHPMailer\PHPMailer\PHPMailer();
// try {
//   $mail->isSMTP();
//   $mail->CharSet = "UTF-8";
//   $mail->SMTPAuth   = true;
//   $mail->Host       = 'smtp.gmail.com';
//   $mail->Username   = 'slagrach@gmail.com';
//   $mail->Password   = 'WorldofWarcraft2017';
//   $mail->SMTPSecure = 'ssl';
//   $mail->Port       = 465;
//   $mail->setFrom('slagrach@gmail.com', 'Заявка с вашего сайта');
//   $mail->addAddress('');
//   $mail->isHTML(true);
//   $mail->Subject = $title;
//   $mail->Body = $body;
//   $mail->send();
// } catch (Exception $e) {
//   $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
// }
// 

$project_name = trim($_POST["project_name"]);
$admin_email  = trim($_POST["admin_email"]);
$form_subject = trim($_POST["form_subject"]);

$c = true;

foreach ($_POST as $key => $value) {
    if (is_array($value)) $value = implode(", ", $value);

    if ($value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject") {
        $message .= (($c = !$c) ? "<tr>" : "<tr style=\"background-color: #f8f8f8;\">") . "
            <td style=\"padding: 10px; border: #e2dddd 1px solid;\"><b>$key</b></td>
            <td style=\"padding: 10px; border: #e2dddd 1px solid;\">$value</td>
        </tr>";
    }
}

$message = "<table style=\"width: 100%;\">$message</table>";

function adopt($text)
{
    return "=?UTF-8?B?" . Base64_encode($text) . "?=";
}

$headers = "MIME-Version: 1.0" . PHP_EOL .
    "Content-Type: text/html; charset=utf-8" . PHP_EOL .
    "From: " . adopt($project_name) . " <" . $admin_email . ">" . PHP_EOL .
    "Reply-To: " . $admin_email . "" . PHP_EOL;

if (mail($admin_email, adopt($form_subject), $message, $headers)) {
    http_response_code(200);
    echo "Данные отправлены.";
} else {
    http_response_code(400);
    echo "Ошибка. Данные не отправлены.";
};