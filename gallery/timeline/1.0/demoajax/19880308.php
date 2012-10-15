<h2>展示code mirror 之 javascript</h2>
<img class="circle" src="http://wiki.ued.taobao.net/lib/exe/fetch.php?media=ued.png" />
<div class="code-show">
  <textarea id="code" name="code">
var myData =　[
{
  'time': '19880308'
  ,'title': 'birth'
}
,{
  'time': '19900308'
  ,'title': 'first run'
}
,{
  'time': '19880408'
  ,'title': 'one month old'
}
,{
  'time': '199409'
  ,'title': 'primary school'
}
,{
  'time': '1997'
  ,'title': 'transfer to private school'
}
,{
  'time': '2000'
  ,'title': 'graduate from primary school, this animal year'
}
,{
  'time': '2001'
  ,'title': 'growing up'
}
,{
  'time': '2003'
  ,'hidden': true
}
,{
  'time': '2012'
  ,'title': 'Taobao UED'
}
// ,{
//   'time': '3000'
//   ,'title': 'forever'
// }
];
  </textarea>
</div>

<script>
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true
  });
</script>
