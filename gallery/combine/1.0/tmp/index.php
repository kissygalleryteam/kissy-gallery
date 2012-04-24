<?php
$a = $_REQUEST;
$key = array_keys($a);
$str = str_replace(array('?t', '?'), '', $key[0]);
$files = explode(',', str_replace('_js', '.js', $str));
$ret = '';
Header("content-type: application/x-javascript");
foreach ($files as $file)
{
    $ret .= file_get_contents($file);
}
echo $ret;
