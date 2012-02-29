<?php
//得到目录下的文件总数
function get_file_count($dir_name){
	$files = 0;
	if ($handle = opendir($dir_name)) {
	while (false !== ($file = readdir($handle))) {
		$files++;
	}
	closedir($handle);
	}
	return $files;
}
//循环删除目录和文件函�?
function delDirAndFile($dirName){
	if ($handle = opendir($dirName) ) {
	   while ( false !== ( $item = readdir($handle) ) ){
		  if ( $item != "." && $item != ".." ) {
		  	unlink("$dirName/$item");
		  }

	   }
	   closedir($handle);

	}
}
$files = array();
$url = 'http://'.$_SERVER['SERVER_NAME'].':'.$_SERVER['SERVER_PORT'].rtrim(dirname($_SERVER['PHP_SELF']), '/\\')."/";
// echo $url;
// print_r($_SERVER);

// print_r ($_FILES);
function uploadFile($file_label){
	// global $url;
	$this_file = $_FILES[$file_label];

}
$fileInput = 'Filedata';
$dir = $_POST['dir'];
$isExceedSize = false;
/*-----------------*/
//以下三行代码用于删除文件，实际应用时请予以删除，get_file_count()和delDirAndFile（）函数都可以删掉
$dirName =  preg_replace('/\//','',$dir);
$size = get_file_count($dirName);
if($size > 3) delDirAndFile($dirName);
/*-----------------*/
$files_name_arr = array($fileInput);
foreach($files_name_arr as $k=>$v){
	$pic = $_FILES[$v];
	$isExceedSize = $pic['size'] > 500000;
	if(!$isExceedSize){
		if(file_exists($dir.$pic['name'])){
			@unlink($dir.$pic['name']);
		}
		move_uploaded_file($pic['tmp_name'], $dir.$pic['name']);
		$files[$k] = $url.$dir.$pic['name'];
	}
}
if(!$isExceedSize){
    $arr = array(
        'status' => 1,
        'data' => array('name' => $_FILES[$fileInput]['name'],
                        'url' => $dir.$_FILES[$fileInput]['name'])
    );
}else{
    $arr = array(
        'status' => 0,
        'msg' => "文件大小超过500kb！"
    );
}

echo json_encode($arr);

?>