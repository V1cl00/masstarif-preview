<?php
// Formular-Mailer für netcup Webhosting (PHP 8). Alternative: Formspree – dann {{FORM_ENDPOINT}} = https://formspree.io/f/XXXX und diese Datei löschen.
// Bei PHP-Variante: {{FORM_ENDPOINT}} = /form.php
const ZIEL = '{{FORM_ZIEL_EMAIL}}';
const ABSENDER = '{{FORM_ABSENDER_EMAIL}}'; // Adresse der eigenen Domain (SPF/DKIM)
const MAX_BYTES = 10 * 1024 * 1024; const MAX_FILES = 5;
const ERLAUBT = ['application/pdf','image/jpeg','image/png','image/heic','image/webp'];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
if (!empty($_POST['website'])) { header('Location: /danke.html'); exit; } // Honeypot
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$tel = preg_replace('/[^0-9+ ()\/-]/', '', $_POST['telefon'] ?? $_POST['tel'] ?? '');
if (!$email && !$tel) { http_response_code(400); exit('Bitte E-Mail oder Telefon angeben.'); }
$felder = '';
foreach ($_POST as $k => $v) { if ($k === 'website') continue; $v = is_array($v) ? implode(', ', $v) : $v;
  $felder .= preg_replace('/[^a-z0-9_-]/i', '', $k) . ': ' . str_replace(["\r","\n"], ' ', mb_substr(strip_tags($v), 0, 2000)) . "\n"; }
$b = bin2hex(random_bytes(12));
$h = "From: Maßtarif Formular <".ABSENDER.">\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$b\"\r\n";
if ($email) $h .= "Reply-To: $email\r\n";
$body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n$felder\r\n";
$n = 0;
foreach ($_FILES as $f) { foreach ((array)$f['tmp_name'] as $i => $tmp) {
  if (!$tmp || !is_uploaded_file($tmp) || ++$n > MAX_FILES) continue;
  $size = is_array($f['size']) ? $f['size'][$i] : $f['size']; if ($size > MAX_BYTES) continue;
  $mime = mime_content_type($tmp); if (!in_array($mime, ERLAUBT, true)) continue;
  $name = preg_replace('/[^A-Za-z0-9._-]/', '_', basename(is_array($f['name']) ? $f['name'][$i] : $f['name']));
  $body .= "--$b\r\nContent-Type: $mime; name=\"$name\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$name\"\r\n\r\n" . chunk_split(base64_encode(file_get_contents($tmp))) . "\r\n"; } }
$body .= "--$b--";
$ok = mail(ZIEL, '=?UTF-8?B?'.base64_encode('Neue Anfrage über masstarif').'?=', $body, $h, '-f'.ABSENDER);
header('Location: ' . ($ok ? '/danke.html' : '/danke.html?fehler=1')); exit;
