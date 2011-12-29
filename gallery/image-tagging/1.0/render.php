<?php
/**
 * Created by JetBrains PhpStorm.
 * User: amdgigabyte
 * Date: 11-12-18
 * To change this template use File | Settings | File Templates.
 */
header('Content-Type: application/x-javascript');
$callback = $_GET['callback'];
$src = $_GET['picSrc'];
$idx = $_GET['idx'];

if ($idx == 1) {
    $coords = '[{top:170,left:130},{top:450,left:360}]';
} else {
    $coords = '[{top:200,left:250},{top:600,left:200},{top:350,left:130}]';
}

echo $callback . '({idx:' . ($idx ? $idx :'') . ', coords:' . $coords . '});'
?>

